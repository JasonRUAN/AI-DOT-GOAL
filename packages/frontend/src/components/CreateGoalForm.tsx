"use client";

import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { useCreateGoal } from "@/mutations/create_goal";
import { useQueryClient } from "@tanstack/react-query";
import { CONSTANTS } from "@/constants";
import { useLanguage } from "@/providers/LanguageProvider";
import toast from "react-hot-toast";

export function CreateGoalForm() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { t, language } = useLanguage();
    const [witnesses, setWitnesses] = useState<string[]>([]);
    const [newWitness, setNewWitness] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [submitStage, setSubmitStage] = useState<
        "idle" | "signing" | "confirming" | "success"
    >("idle");

    // 使用新的 mutation API
    const { mutation: createGoalMutation, isConfirming, isConfirmed } = useCreateGoal();

    // 根据当前语言创建表单验证架构
    const getFormSchema = () =>
        z.object({
            title: z
                .string()
                .min(2, {
                    message:
                        language === "zh"
                            ? "目标标题至少需要2个字符"
                            : "Title must be at least 2 characters",
                })
                .max(50, {
                    message:
                        language === "zh"
                            ? "目标标题不能超过50个字符"
                            : "Title cannot exceed 50 characters",
                }),
            description: z
                .string()
                .min(10, {
                    message:
                        language === "zh"
                            ? "目标描述至少需要10个字符"
                            : "Description must be at least 10 characters",
                })
                .max(500, {
                    message:
                        language === "zh"
                            ? "目标描述不能超过500个字符"
                            : "Description cannot exceed 500 characters",
                }),
            aiSuggestion: z.string().max(2000, {
                message:
                    language === "zh"
                        ? "AI建议不能超过2000个字符"
                        : "AI suggestion cannot exceed 2000 characters",
            }),
            endDate: z.date({
                required_error:
                    language === "zh"
                        ? "请选择目标完成日期"
                        : "Please select a deadline",
            }),
            stake: z.string().min(1, {
                message:
                    language === "zh"
                        ? "请输入保证金金额"
                        : "Please enter a stake amount",
            }),
            witnesses: z.array(z.string()).min(1, {
                message:
                    language === "zh"
                        ? "至少需要一位见证人"
                        : "At least one witness is required",
            }),
        });

    const formSchema = getFormSchema();

    // 监听交易确认状态
    useEffect(() => {
        if (isConfirmed) {
            // 交易确认成功
            setSubmitStage("success");
            toast.success(
                language === "zh"
                    ? "🎉 目标创建成功！正在跳转..."
                    : "🎉 Goal created successfully! Redirecting...",
                { duration: 2000 }
            );

            // 使缓存失效
            queryClient.invalidateQueries({
                queryKey: ["readContract"],
            });

            // 延迟跳转，让用户看到成功提示
            setTimeout(() => {
                router.push("/my-goals");
            }, 1000);
        }
    }, [isConfirmed, language, router, queryClient]);

    const { mutate: createGoalMutate } = createGoalMutation;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            aiSuggestion: "",
            stake: "",
            witnesses: [],
        },
    });

    // 当语言变化时更新表单验证规则
    useEffect(() => {
        form.clearErrors();
    }, [language, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        setSubmitStage("signing");

        const goalInfo = {
            title: values.title,
            description: values.description,
            ai_suggestion: values.aiSuggestion,
            deadline: values.endDate.getTime(),
            amount: parseFloat(values.stake),
            witnesses: values.witnesses,
        };

        createGoalMutate(goalInfo, {
            onSuccess: (txHash) => {
                console.log("✅ 交易已提交:", txHash);
                setSubmitStage("confirming");

                // 显示确认中提示
                toast.success(
                    language === "zh"
                        ? "📝 交易已提交，等待区块链确认..."
                        : "📝 Transaction submitted, waiting for confirmation...",
                    { duration: 3000 }
                );

                // 重置表单
                form.reset();
                setWitnesses([]);
            },
            onError: (error) => {
                console.error(
                    language === "zh"
                        ? "创建目标失败:"
                        : "Failed to create goal:",
                    error
                );
                setSubmitStage("idle");
                
                toast.error(
                    language === "zh"
                        ? "❌ 创建目标失败，请重试"
                        : "❌ Failed to create goal, please try again"
                );
            },
        });
    }

    const addWitness = () => {
        if (newWitness && !witnesses.includes(newWitness)) {
            const updatedWitnesses = [...witnesses, newWitness];
            setWitnesses(updatedWitnesses);
            form.setValue("witnesses", updatedWitnesses);
            setNewWitness("");
        }
    };

    const removeWitness = (witness: string) => {
        const updatedWitnesses = witnesses.filter((w) => w !== witness);
        setWitnesses(updatedWitnesses);
        form.setValue("witnesses", updatedWitnesses);
    };

    const onAIClick = async () => {
        const title = form.getValues("title");
        const description = form.getValues("description");

        if (!title || !description) {
            form.setError("aiSuggestion", {
                message:
                    language === "zh"
                        ? "请先填写目标标题和描述，以便生成个性化AI建议"
                        : "Please fill in the goal title and description first to generate personalized AI suggestions",
            });
            return;
        }

        try {
            // 显示加载状态
            setIsGenerating(true);
            form.setValue(
                "aiSuggestion",
                language === "zh" ? "AI正在思考中..." : "AI is thinking...",
            );

            // 调用AI生成建议的API
            const response = await fetch(
                `${CONSTANTS.BACKEND_URL}/deepseek/get_ai_suggestion`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content:
                            language === "zh"
                                ? `目标标题：${title}\n目标描述：${description}`
                                : `Goal Title: ${title}\nGoal Description: ${description}`,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(
                    language === "zh"
                        ? "生成建议失败"
                        : "Failed to generate suggestion",
                );
            }

            const data = await response.json();
            console.log(">>> data", JSON.stringify(data, null, 2));
            form.setValue(
                "aiSuggestion",
                data.message,
                // JSON.stringify(data.message, null, 2)
            );
        } catch (error) {
            console.error(
                language === "zh"
                    ? "生成AI建议失败:"
                    : "Failed to generate AI suggestion:",
                error,
            );
            form.setError("aiSuggestion", {
                message:
                    language === "zh"
                        ? "生成建议时出错，请稍后再试"
                        : "Error generating suggestion, please try again later",
            });
            form.setValue("aiSuggestion", "");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto backdrop-blur-sm bg-white/10 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700">
            <CardHeader>
                <CardTitle className="text-2xl">{t("createNewGoal")}</CardTitle>
                <CardDescription>
                    {language === "zh"
                        ? "设置你的目标，邀请见证人，锁定保证金，开始你的目标之旅"
                        : "Set your goal, invite witnesses, lock in your stake, and begin your goal journey"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("goalTitle")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={
                                                language === "zh"
                                                    ? "例如：每天跑步5公里"
                                                    : "e.g., Run 5km every day"
                                            }
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {language === "zh"
                                            ? "简洁明了地描述你的目标"
                                            : "Describe your goal concisely"}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("goalDescription")}
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={
                                                language === "zh"
                                                    ? "详细描述你的目标，包括如何验证目标是否完成"
                                                    : "Describe your goal in detail, including how to verify if it's completed"
                                            }
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {language === "zh"
                                            ? "详细描述你的目标，以便见证人能够清楚了解"
                                            : "Describe your goal in detail so witnesses can clearly understand"}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="aiSuggestion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {language === "zh"
                                            ? "AI建议"
                                            : "AI Suggestion"}
                                    </FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Textarea
                                                placeholder={
                                                    language === "zh"
                                                        ? "AI将根据你的目标提供建议和指导"
                                                        : "AI will provide suggestions and guidance based on your goal"
                                                }
                                                className="resize-none pr-12 border-gradient-red focus:ring-2 focus:ring-red-500/50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <Button
                                            onClick={() => onAIClick()}
                                            type="button"
                                            disabled={isGenerating}
                                            className="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 rounded-full shadow-lg hover:shadow-blue-400/50 transition-all duration-300 border-0 group overflow-hidden"
                                            style={{
                                                boxShadow: isGenerating
                                                    ? "0 0 15px rgba(59, 130, 246, 0.7)"
                                                    : "",
                                            }}
                                        >
                                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 animate-pulse-slow rounded-full"></span>
                                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:animate-ping"></span>
                                            <span className="absolute inset-0 -m-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 animate-pulse"></span>
                                            {isGenerating ? (
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent relative z-10" />
                                            ) : (
                                                <Sparkles className="h-5 w-5 text-white group-hover:animate-pulse relative z-10" />
                                            )}
                                        </Button>
                                    </div>
                                    <FormDescription>
                                        {language === "zh"
                                            ? "AI将根据你的目标提供个性化的建议和指导"
                                            : "AI will provide personalized suggestions and guidance based on your goal"}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>{t("deadline")}</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value &&
                                                            "text-muted-foreground",
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(
                                                            field.value,
                                                            "PPP",
                                                        )
                                                    ) : (
                                                        <span>
                                                            {language === "zh"
                                                                ? "选择日期"
                                                                : "Select date"}
                                                        </span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date: Date) =>
                                                    date <
                                                    new Date(
                                                        new Date().setHours(
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                        ),
                                                    )
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>
                                        {language === "zh"
                                            ? "选择你计划完成目标的日期"
                                            : "Select the date you plan to complete your goal"}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="stake"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {language === "zh"
                                            ? "保证金 (PAS)"
                                            : "Stake (PAS)"}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            placeholder="0.1"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {language === "zh"
                                            ? "设置你愿意锁定的保证金金额，如果未完成目标，这笔金额将分给见证人"
                                            : "Set the amount of stake you're willing to lock in. If you don't complete the goal, this amount will be distributed to the witnesses"}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="witnesses"
                            render={() => (
                                <FormItem>
                                    <FormLabel>{t("witness")}</FormLabel>
                                    <div className="flex gap-2">
                                        <FormControl>
                                            <Input
                                                placeholder={
                                                    language === "zh"
                                                        ? "输入见证人的钱包地址"
                                                        : "Enter the witness's wallet address"
                                                }
                                                value={newWitness}
                                                onChange={(e) =>
                                                    setNewWitness(
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            onClick={addWitness}
                                            size="icon"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {witnesses.map((witness) => (
                                            <div
                                                key={`witness-${witness}`}
                                                className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                                            >
                                                <span className="truncate max-w-[200px]">
                                                    {witness.length > 14
                                                        ? `${witness.slice(
                                                              0,
                                                              8,
                                                          )}...${witness.slice(
                                                              -6,
                                                          )}`
                                                        : witness}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 ml-1 p-0"
                                                    onClick={() =>
                                                        removeWitness(witness)
                                                    }
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <FormDescription>
                                        {language === "zh"
                                            ? "添加能够验证你目标完成情况的见证人"
                                            : "Add witnesses who can verify your goal completion"}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            disabled={submitStage !== "idle" || isConfirming}
                        >
                            {submitStage === "signing" ? (
                                <div className="flex items-center justify-center">
                                    <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>
                                        {language === "zh"
                                            ? "请在钱包中确认..."
                                            : "Confirm in wallet..."}
                                    </span>
                                </div>
                            ) : submitStage === "confirming" || isConfirming ? (
                                <div className="flex items-center justify-center">
                                    <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>
                                        {language === "zh"
                                            ? "等待区块链确认..."
                                            : "Waiting for confirmation..."}
                                    </span>
                                </div>
                            ) : submitStage === "success" ? (
                                <div className="flex items-center justify-center">
                                    <span>
                                        {language === "zh"
                                            ? "✅ 创建成功！"
                                            : "✅ Created successfully!"}
                                    </span>
                                </div>
                            ) : language === "zh" ? (
                                "创建目标"
                            ) : (
                                "Create Goal"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
