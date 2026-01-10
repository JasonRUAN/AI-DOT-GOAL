"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetOneGoal } from "@/hooks/useGetOneGoal";
import {
    GoalDetail as GoalDetailType,
    CommentDetail,
    ProgressUpdateDetail,
} from "@/types/move";
import {
    CalendarDays,
    Clock,
    Coins,
    MessageSquare,
    ThumbsUp,
    Users,
    MessageCircle,
    Check,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useGetGoalAgentId } from "@/hooks/useGetGoalAgentId";
import GoalAgent from "./GoalAgent";
import { Input } from "./ui/input";
import { useState, useEffect, useRef } from "react";
import { useCreateComment } from "@/mutations/create_comment";
import { useGetGoalComments } from "@/hooks/useGetGoalComments";
import { useGetGoalProgressUpdates } from "@/hooks/useGetGoalProgressUpdates";
import { ProgressUpdateDialog } from "@/components/ProgressUpdateDialog";
import { ChatBox } from "./ChatBox";
import { useConfirmWitness } from "@/mutations/confirm_witness";
import { useCompleteGoal } from "@/mutations/complete_goal";
import { useLanguage } from "@/providers/LanguageProvider";
import { CONSTANTS } from "@/constants";
import { useAccount } from "wagmi";

interface GoalDetailProps {
    id: string;
}

export function GoalDetail({ id }: GoalDetailProps) {
    const { address } = useAccount();
    const { language } = useLanguage();
    const [commentText, setCommentText] = useState("");
    const [localComments, setLocalComments] = useState<CommentDetail[]>([]);
    const [localProgressUpdates, setLocalProgressUpdates] = useState<
        ProgressUpdateDetail[]
    >([]);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const aiAssistantRef = useRef<HTMLDivElement>(null);
    const [hasConfirmed, setHasConfirmed] = useState(false);
    const [allWitnessesConfirmed, setAllWitnessesConfirmed] = useState(false);
    const goalId = Number(id);

    const createCommentMutation = useCreateComment();
    const { mutate: createComment, isPending: isSubmittingComment, isConfirming } = createCommentMutation;

    const { mutate: confirmWitness, isPending: isConfirmingWitness } =
        useConfirmWitness();

    const { mutate: completeGoal, isPending: isCompletingGoal, isConfirmed: isCompleteGoalConfirmed } =
        useCompleteGoal();

    // 从API获取goalAgentId
    const { agentId: goalAgentId, refetch: refetchAgentId } = useGetGoalAgentId(
        {
            goalId,
        },
    );

    const { data: goalComments, refetch: refetchComments } = useGetGoalComments(
        { goalId },
    );

    const { data: progressUpdates, refetch: refetchProgressUpdates } =
        useGetGoalProgressUpdates({ goalId });

    const {
        data,
        isPending: loading,
        error,
        refetch: refetchGoal,
    } = useGetOneGoal({ goalId });

    // 当远程评论数据更新时，更新本地评论状态
    useEffect(() => {
        console.log("💬 [GoalDetail] Comments updated:", goalComments);
        if (goalComments) {
            setLocalComments([...goalComments]);
        }
    }, [goalComments]);

    // 当交易确认成功后显示成功消息
    useEffect(() => {
        // 只有在之前处于确认中状态，且现在确认完成（不再 pending 和 confirming）时才显示成功消息
        if (createCommentMutation.isSuccess && !createCommentMutation.isPending && !isConfirming) {
            toast.success(
                language === "zh"
                    ? "评论发送成功"
                    : "Comment sent successfully",
            );
            setCommentText("");
            
            // 后台静默刷新数据
            refetchGoal?.();
            refetchComments();
        }
    }, [createCommentMutation.isSuccess, createCommentMutation.isPending, isConfirming, language, refetchGoal, refetchComments]);

    // 当远程进度更新数据更新时，更新本地进度更新状态
    useEffect(() => {
        console.log("📈 [GoalDetail] Progress updates changed:", {
            progressUpdates,
            count: progressUpdates?.length,
        });
        if (progressUpdates) {
            setLocalProgressUpdates([...progressUpdates]);
            console.log("✅ [GoalDetail] Local progress updates set:", progressUpdates.length);
        }
    }, [progressUpdates]);

    // 当数据更新时，检查当前用户是否已确认
    useEffect(() => {
        if (data && address) {
            const goalData = data as GoalDetailType;
            const isConfirmed =
                goalData.confirmations &&
                goalData.confirmations.some(
                    (confirmation) => confirmation === address,
                );
            setHasConfirmed(isConfirmed);

            // 检查是否所有见证人都已确认
            const allConfirmed =
                goalData.witnesses.length > 0 &&
                goalData.confirmations &&
                goalData.witnesses.every((witness) =>
                    goalData.confirmations.some(
                        (confirmation) => confirmation === witness,
                    ),
                );
            setAllWitnessesConfirmed(allConfirmed);
        }
    }, [data, address]);

    // 当完成目标交易确认后显示成功消息并刷新数据
    useEffect(() => {
        if (isCompleteGoalConfirmed) {
            toast.success(
                language === "zh"
                    ? "目标已成功完成！"
                    : "Goal successfully completed!",
            );
            refetchGoal?.(); // 刷新目标数据
        }
    }, [isCompleteGoalConfirmed, language, refetchGoal]);

    if (error) {
        toast.error(`get goal failed: ${error.message}`);
        return;
    }

    if (loading) {
        return (
            <div className="text-center py-12">
                {language === "zh" ? "加载中..." : "Loading..."}
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                {language === "zh"
                    ? "未找到目标信息"
                    : "Goal information not found"}
            </div>
        );
    }

    const goalData = data as GoalDetailType;
    const isCreator = goalData.creator === address;

    const witnesses = goalData.witnesses;
    const isWitness = witnesses.some((witness) => witness === address);

    // 检查进度是否已达到100%
    const isProgressComplete = Number(goalData.progressPercentage) >= 100;

    console.log(`isCreator: ${isCreator}, isWitness: ${isWitness}`);

    const getStatusText = (status: number) => {
        switch (status) {
            case 1:
                return language === "zh" ? "已完成" : "Completed";
            case 2:
                return language === "zh" ? "失败" : "Failed";
            default:
                return language === "zh" ? "进行中" : "In Progress";
        }
    };

    const handleCommentSubmit = () => {
        if (!commentText.trim()) {
            toast.error(
                language === "zh"
                    ? "评论内容不能为空"
                    : "Comment cannot be empty",
            );
            return;
        }

        createComment(
            {
                goalId: Number(id),
                content: commentText.trim(),
            },
            {
                onError: (error) => {
                    toast.error(
                        language === "zh"
                            ? `评论发送失败: ${error.message}`
                            : `Failed to send comment: ${error.message}`,
                    );
                },
            },
        );
    };

    // 处理显示AI助手时的滚动
    const handleToggleAIAssistant = () => {
        setShowAIAssistant(!showAIAssistant);

        // 如果是从隐藏变为显示，等待DOM更新后滚动到AI助手区域
        if (!showAIAssistant) {
            setTimeout(() => {
                aiAssistantRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
        }
    };

    // 处理确认完成按钮点击
    const handleConfirmWitness = () => {
        confirmWitness(id, {
            onSuccess: () => {
                toast.success(
                    language === "zh"
                        ? "已成功确认目标完成"
                        : "Successfully confirmed goal completion",
                );
                setHasConfirmed(true); // 立即更新本地状态
                refetchGoal?.(); // 同时从服务器获取最新状态
            },
            onError: (error) => {
                toast.error(
                    language === "zh"
                        ? `确认失败: ${error.message}`
                        : `Confirmation failed: ${error.message}`,
                );
            },
        });
    };

    // 处理完成目标按钮点击
    const handleCompleteGoal = () => {
        completeGoal(id, {
            onError: (error) => {
                toast.error(
                    language === "zh"
                        ? `完成目标失败: ${error.message}`
                        : `Failed to complete goal: ${error.message}`,
                );
            },
        });
    };

    return (
        <div className="container mx-auto px-1">
            <div className="grid gap-8">
                {/* 目标信息卡片 */}
                <div className="lg:col-span-2">
                    <Card className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl">
                                        {goalData.title}
                                    </CardTitle>
                                    <CardDescription className="flex items-center mt-2">
                                        {/* <Avatar className="h-6 w-6 mr-2">
                                            <AvatarImage
                                                src={goalData.creator.avatar}
                                                alt={goalData.creator.name}
                                            />
                                            <AvatarFallback>
                                                {goalData.creator.name[0]}
                                            </AvatarFallback>
                                        </Avatar> */}
                                        {language === "zh"
                                            ? "由 "
                                            : "Created by "}
                                        <span className="relative group cursor-text">
                                            <span className="text-blue-500 hover:text-orange-600">
                                                {goalData.creator.slice(0, 6) +
                                                    "..." +
                                                    goalData.creator.slice(-4)}
                                            </span>
                                            <span className="absolute left-0 -top-8 min-w-max max-w-none opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 text-xs rounded py-2 px-3 shadow-md transition-opacity duration-300 whitespace-nowrap overflow-visible select-text z-10">
                                                {goalData.creator}
                                            </span>
                                        </span>{" "}
                                        {language === "zh" ? "创建" : ""}
                                    </CardDescription>
                                </div>
                                <Badge
                                    className={`text-white ${
                                        goalData.status === 1
                                            ? "bg-blue-500"
                                            : goalData.status === 2
                                              ? "bg-red-500"
                                              : "bg-green-500"
                                    }`}
                                >
                                    {getStatusText(goalData.status)}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-gray-700 dark:text-gray-300">
                                {goalData.description}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <CalendarDays className="h-5 w-5 text-blue-500 mb-2" />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {language === "zh"
                                            ? "开始日期"
                                            : "Start Date"}
                                    </span>
                                    <span className="font-medium">
                                        {format(
                                            new Date(
                                                Number(goalData.createdAt) * 1000
                                            ),
                                            "yyyy-MM-dd",
                                        )}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <CalendarDays className="h-5 w-5 text-purple-500 mb-2" />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {language === "zh"
                                            ? "结束日期"
                                            : "End Date"}
                                    </span>
                                    <span className="font-medium">
                                        {format(
                                            new Date(Number(goalData.deadline)),
                                            "yyyy-MM-dd",
                                        )}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <Coins className="h-5 w-5 text-green-500 mb-2" />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {language === "zh" ? "保证金" : "Stake"}
                                    </span>
                                    <span className="font-medium">
                                        {Number(goalData.amount) / 10 ** 18} PAS
                                    </span>
                                </div>
                                <div className="flex flex-col items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <Clock className="h-5 w-5 text-yellow-500 mb-2" />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {language === "zh"
                                            ? "剩余天数"
                                            : "Days Left"}
                                    </span>
                                    <span className="font-medium">
                                        {Math.max(
                                            Math.ceil(
                                                (Number(goalData.deadline) -
                                                    Date.now()) /
                                                    (1000 * 60 * 60 * 24),
                                            ),
                                            0,
                                        )}{" "}
                                        {language === "zh" ? "天" : "days"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">
                                        {language === "zh"
                                            ? "完成进度"
                                            : "Completion Progress"}
                                    </span>
                                    <span>{goalData.progressPercentage}%</span>
                                </div>
                                <Progress
                                    value={Number(goalData.progressPercentage)}
                                    className="h-2"
                                />
                            </div>

                            {/* 重新设计的 AI 建议部分 */}
                            <div className="space-y-2">
                                <div className="flex items-center text-sm">
                                    <span className="font-medium">
                                        {language === "zh"
                                            ? "AI 建议"
                                            : "AI Suggestion"}
                                    </span>
                                </div>
                                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg border border-red-200 dark:border-red-800/30 shadow-lg relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 animate-pulse-slow"></div>
                                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500/30 to-orange-500/30 blur-md animate-pulse-slow"></div>
                                    <div className="absolute -inset-2 bg-gradient-to-r from-red-500/5 to-orange-500/5 blur-xl"></div>
                                    <p className="text-red-600 dark:text-red-300 leading-relaxed relative z-10 whitespace-pre-line">
                                        {goalData.aiSuggestion ||
                                            (language === "zh"
                                                ? "暂无建议"
                                                : "No suggestions yet")}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-3 flex items-center">
                                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                                    {language === "zh"
                                        ? `见证人 (${goalData.witnesses.length})`
                                        : `Witnesses (${goalData.witnesses.length})`}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {goalData.witnesses.map(
                                        (witness, index) => {
                                            const isConfirmed =
                                                goalData.confirmations &&
                                                goalData.confirmations.some(
                                                    (confirmation) =>
                                                        confirmation ===
                                                        witness,
                                                );

                                            const isCurrentUser =
                                                witness === address;

                                            return (
                                                <div
                                                    key={`witness-${index}`}
                                                    className={`p-2 rounded-md flex items-center bg-gray-50 dark:bg-gray-800/50 ${
                                                        isCurrentUser
                                                            ? "ring-2 ring-blue-300 dark:ring-blue-700"
                                                            : ""
                                                    }`}
                                                >
                                                    <span className="w-6 h-6 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-300 mr-2">
                                                        {index + 1}
                                                    </span>
                                                    <span className="relative group cursor-text flex items-center">
                                                        {isCurrentUser && (
                                                            <span className="absolute -top-2 -left-1 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                                                                {language ===
                                                                "zh"
                                                                    ? "我"
                                                                    : "Me"}
                                                            </span>
                                                        )}
                                                        <span
                                                            className={`${
                                                                isConfirmed
                                                                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 py-1 px-2 rounded-md flex items-center"
                                                                    : "text-blue-500"
                                                            } hover:text-orange-600 ${
                                                                isCurrentUser
                                                                    ? "mt-3"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {witness.slice(
                                                                0,
                                                                8,
                                                            ) +
                                                                "..." +
                                                                witness.slice(
                                                                    -6,
                                                                )}
                                                            {isConfirmed && (
                                                                <Check className="h-4 w-4 text-green-500 ml-1.5" />
                                                            )}
                                                        </span>
                                                        <span className="absolute left-0 -top-8 min-w-max max-w-none opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 text-xs rounded py-2 px-3 shadow-md transition-opacity duration-300 whitespace-nowrap overflow-visible select-text z-10">
                                                            {witness}
                                                        </span>
                                                    </span>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 w-full">
                                {isCreator && (
                                    <>
                                        <ProgressUpdateDialog
                                            goalId={Number(id)}
                                            currentProgress={Number(
                                                goalData.progressPercentage,
                                            )}
                                            onProgressUpdated={async () => {
                                                console.log("🔄 [GoalDetail] Progress updated, starting refetch...");
                                                // 先刷新 goal 数据以获取最新的 progressUpdateCounter
                                                const goalResult = await refetchGoal?.();
                                                console.log("📊 [GoalDetail] Goal refetched:", goalResult?.data);
                                                
                                                // 然后刷新进度更新列表
                                                setTimeout(async () => {
                                                    console.log("⏰ [GoalDetail] Timeout triggered, refetching progress updates...");
                                                    const progressResult = await refetchProgressUpdates();
                                                    console.log("📈 [GoalDetail] Progress updates refetched:", {
                                                        data: progressResult?.data,
                                                        count: progressResult?.data?.length,
                                                    });
                                                }, 500);
                                            }}
                                            isCreator={isCreator}
                                        />

                                        <Button
                                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                            onClick={handleToggleAIAssistant}
                                        >
                                            <MessageCircle className="mr-2 h-4 w-4" />
                                            {showAIAssistant
                                                ? language === "zh"
                                                    ? "隐藏我的AI目标规划师"
                                                    : "Hide my AI Goal Planner"
                                                : language === "zh"
                                                  ? "跟我的AI目标规划师对话"
                                                  : "Chat with my AI Goal Planner"}
                                        </Button>

                                        {isCreator &&
                                            allWitnessesConfirmed &&
                                            goalData.status === 0 && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="w-full">
                                                                <Button
                                                                    className={`w-full ${
                                                                        isProgressComplete
                                                                            ? "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                                                                            : "bg-gray-400 cursor-not-allowed"
                                                                    }`}
                                                                    onClick={handleCompleteGoal}
                                                                    disabled={
                                                                        isCompletingGoal ||
                                                                        !isProgressComplete
                                                                    }
                                                                >
                                                                    {isCompletingGoal ? (
                                                                        <>
                                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                                            {language === "zh"
                                                                                ? "确认中..."
                                                                                : "Confirming..."}
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Check className="mr-2 h-4 w-4" />{" "}
                                                                            {language === "zh"
                                                                                ? "完成目标"
                                                                                : "Complete Goal"}
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </TooltipTrigger>
                                                        {!isProgressComplete && (
                                                            <TooltipContent>
                                                                <p>
                                                                    {language === "zh"
                                                                        ? `进度需达到100%才能完成目标 (当前: ${goalData.progressPercentage}%)`
                                                                        : `Progress must reach 100% to complete goal (current: ${goalData.progressPercentage}%)`}
                                                                </p>
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                    </>
                                )}

                                {isWitness && !hasConfirmed && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="w-full">
                                                    <Button
                                                        className={`w-full ${
                                                            isProgressComplete
                                                                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                                                : "bg-gray-400 cursor-not-allowed"
                                                        }`}
                                                        onClick={handleConfirmWitness}
                                                        disabled={
                                                            isConfirmingWitness ||
                                                            !isProgressComplete
                                                        }
                                                    >
                                                        {isConfirmingWitness ? (
                                                            language === "zh" ? (
                                                                "确认中..."
                                                            ) : (
                                                                "Confirming..."
                                                            )
                                                        ) : (
                                                            <>
                                                                <ThumbsUp className="mr-2 h-4 w-4" />{" "}
                                                                {language === "zh"
                                                                    ? "确认完成"
                                                                    : "Confirm Completion"}
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </TooltipTrigger>
                                            {!isProgressComplete && (
                                                <TooltipContent>
                                                    <p>
                                                        {language === "zh"
                                                            ? `进度需达到100%才能确认完成 (当前: ${goalData.progressPercentage}%)`
                                                            : `Progress must reach 100% to confirm completion (current: ${goalData.progressPercentage}%)`}
                                                    </p>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                {isWitness && hasConfirmed && (
                                    <Button
                                        variant="outline"
                                        className="w-full bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                        disabled
                                    >
                                        <Check className="mr-2 h-4 w-4" />{" "}
                                        {language === "zh"
                                            ? "已确认完成"
                                            : "Confirmed Completion"}
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>

                    {showAIAssistant && isCreator && (
                        <div ref={aiAssistantRef}>
                            <Card className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 mt-8">
                                <CardContent className="pt-6">
                                    {goalAgentId ? (
                                        <div>
                                            <ChatBox
                                                goalId={id}
                                                agentId={String(goalAgentId)}
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <GoalAgent
                                                goalId={id}
                                                onAgentCreated={() => {
                                                    // 当Agent创建成功后，重新获取goalAgentId
                                                    refetchAgentId?.();
                                                }}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <Tabs defaultValue="updates" className="mt-8">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="updates">
                                {language === "zh"
                                    ? "进度更新"
                                    : "Progress Updates"}
                            </TabsTrigger>
                            <TabsTrigger value="comments">
                                {language === "zh" ? "评论" : "Comments"}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="updates" className="mt-4 space-y-4">
                            {(() => {
                                console.log("🎨 [GoalDetail] Rendering progress updates tab:", {
                                    localProgressUpdates,
                                    count: localProgressUpdates?.length,
                                    hasUpdates: localProgressUpdates && localProgressUpdates.length > 0,
                                });
                                return null;
                            })()}
                            {localProgressUpdates &&
                            localProgressUpdates.length > 0 ? (
                                [...localProgressUpdates]
                                    .reverse()
                                    .map(
                                        (
                                            update: ProgressUpdateDetail,
                                            index: number,
                                        ) => (
                                            <div
                                                key={`update-${index}`}
                                                className="flex space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <h4 className="font-medium">
                                                            <span className="relative group cursor-text">
                                                                <span className="text-blue-500 hover:text-orange-600">
                                                                    {update.creator.slice(
                                                                        0,
                                                                        6,
                                                                    ) +
                                                                        "..." +
                                                                        update.creator.slice(
                                                                            -4,
                                                                        )}
                                                                </span>
                                                                <span className="absolute left-0 -top-8 min-w-max max-w-none opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 text-xs rounded py-2 px-3 shadow-md transition-opacity duration-300 whitespace-nowrap overflow-visible select-text z-10">
                                                                    {
                                                                        update.creator
                                                                    }
                                                                </span>
                                                            </span>
                                                        </h4>
                                                        <span className="text-sm text-gray-500">
                                                            {format(
                                                                new Date(
                                                                    Number(update.createdAt) * 1000
                                                                ),
                                                                "yyyy-MM-dd HH:mm:ss",
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1">
                                                        {update.content}
                                                    </p>
                                                    {update.proofFileBlobId && (
                                                        <div className="mt-2">
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        const response =
                                                                            await fetch(
                                                                                `${CONSTANTS.BACKEND_URL}/pinata/download/${update.proofFileBlobId}`,
                                                                            );
                                                                        if (
                                                                            !response.ok
                                                                        ) {
                                                                            const errorData =
                                                                                await response.json();
                                                                            throw new Error(
                                                                                errorData.error ||
                                                                                    "下载失败",
                                                                            );
                                                                        }

                                                                        // 获取文件名
                                                                        const contentDisposition =
                                                                            response.headers.get(
                                                                                "Content-Disposition",
                                                                            );
                                                                        let filename = `proof-${update.proofFileBlobId}`;
                                                                        if (
                                                                            contentDisposition
                                                                        ) {
                                                                            const matches =
                                                                                /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
                                                                                    contentDisposition,
                                                                                );
                                                                            if (
                                                                                matches !=
                                                                                    null &&
                                                                                matches[1]
                                                                            ) {
                                                                                filename =
                                                                                    matches[1].replace(
                                                                                        /['"]/g,
                                                                                        "",
                                                                                    );
                                                                            }
                                                                        }

                                                                        // 获取文件内容
                                                                        const blob =
                                                                            await response.blob();
                                                                        const url =
                                                                            window.URL.createObjectURL(
                                                                                blob,
                                                                            );
                                                                        const a =
                                                                            document.createElement(
                                                                                "a",
                                                                            );
                                                                        a.href =
                                                                            url;
                                                                        a.download =
                                                                            filename;
                                                                        document.body.appendChild(
                                                                            a,
                                                                        );
                                                                        a.click();
                                                                        window.URL.revokeObjectURL(
                                                                            url,
                                                                        );
                                                                        document.body.removeChild(
                                                                            a,
                                                                        );
                                                                    } catch (err: unknown) {
                                                                        console.error(
                                                                            "下载失败:",
                                                                            err,
                                                                        );
                                                                        const errorMessage =
                                                                            err instanceof
                                                                            Error
                                                                                ? err.message
                                                                                : "未知错误";
                                                                        toast.error(
                                                                            language ===
                                                                                "zh"
                                                                                ? `下载证明文件失败: ${errorMessage}`
                                                                                : `Failed to download proof file: ${errorMessage}`,
                                                                        );
                                                                    }
                                                                }}
                                                                className="text-sm text-blue-500 hover:text-blue-700"
                                                            >
                                                                {language ===
                                                                "zh"
                                                                    ? "下载证明文件"
                                                                    : "Download proof file"}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    )
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    {language === "zh"
                                        ? "暂无进度更新"
                                        : "No progress updates yet"}
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent
                            value="comments"
                            className="mt-4 space-y-4"
                        >
                            <div className="flex items-center space-x-2">
                                <Input
                                    placeholder={
                                        language === "zh"
                                            ? "添加评论..."
                                            : "Add a comment..."
                                    }
                                    className="flex-1"
                                    value={commentText}
                                    onChange={(e) => {
                                        setCommentText(e.target.value);
                                    }}
                                />
                                <Button
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                    size="sm"
                                    onClick={handleCommentSubmit}
                                    disabled={
                                        isSubmittingComment ||
                                        !commentText.trim()
                                    }
                                >
                                    {isSubmittingComment ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            {language === "zh" ? "确认中..." : "Confirming..."}
                                        </>
                                    ) : (
                                        <>
                                            <MessageSquare className="h-4 w-4 mr-2" />{" "}
                                            {language === "zh"
                                                ? "发送"
                                                : "Send"}
                                        </>
                                    )}
                                </Button>
                            </div>
                            {localComments &&
                                [...localComments]
                                    .reverse()
                                    .map(
                                        (
                                            comment: CommentDetail,
                                            index: number,
                                        ) => {
                                            console.log("Comment Data:", {
                                                id: comment.id,
                                                creator: comment.creator,
                                                createdAt: comment.createdAt,
                                                createdAtType: typeof comment.createdAt,
                                                createdAtValue: String(comment.createdAt),
                                            });
                                            return (
                                            <div
                                                key={`comment-${index}`}
                                                className="flex space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                            >
                                                {/* <Avatar>
                                        <AvatarImage
                                            src={comment.avatar}
                                            alt={comment.user}
                                        />
                                        <AvatarFallback>
                                            {comment.user[0]}
                                        </AvatarFallback>
                                    </Avatar> */}
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <h4 className="font-medium">
                                                            <span className="relative group cursor-text">
                                                                <span className="text-blue-500 hover:text-orange-600">
                                                                    {comment?.creator
                                                                        ? `${comment.creator.slice(0, 6)}...${comment.creator.slice(-4)}`
                                                                        : "未知地址"}
                                                                </span>
                                                                <span className="absolute left-0 -top-8 min-w-max max-w-none opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 text-xs rounded py-2 px-3 shadow-md transition-opacity duration-300 whitespace-nowrap overflow-visible select-text z-10">
                                                                    {comment?.creator ||
                                                                        "未知地址"}
                                                                </span>
                                                            </span>
                                                        </h4>
                                                        <span className="text-sm text-gray-500">
                                                            {format(
                                                                new Date(
                                                                    Number(comment.createdAt) * 1000
                                                                ),
                                                                "yyyy-MM-dd HH:mm:ss",
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                            );
                                        },
                                    )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
