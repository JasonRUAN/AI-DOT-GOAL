"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AIConfig } from "@/types/ai/eliza/character";
import { defaultConfig } from "@/constants/ai/AIConfig";
import { useCreateAgent } from "@/mutations/create_agent";
import { elizaClient } from "@/lib/elizaClient";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";

interface GoalAgentProps {
    goalId: string;
    onAgentCreated?: () => void;
}

export default function GoalAgent({ goalId, onAgentCreated }: GoalAgentProps) {
    const { language } = useLanguage();
    const [open, setOpen] = useState(false);
    const [config, setConfig] = useState<AIConfig>(defaultConfig);

    const { mutate: createAgentMutation } = useCreateAgent();

    const handleChange = (
        field: keyof AIConfig,
        value: string | string[] | unknown
    ) => {
        setConfig((prev) => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (
        field: keyof AIConfig,
        index: number,
        value: string
    ) => {
        setConfig((prev) => {
            const newArray = [...(prev[field] as string[])];
            newArray[index] = value;
            return { ...prev, [field]: newArray };
        });
    };

    const handleAddArrayItem = (field: keyof AIConfig) => {
        setConfig((prev) => ({
            ...prev,
            [field]: [...(prev[field] as string[]), ""],
        }));
    };

    const handleRemoveArrayItem = (field: keyof AIConfig, index: number) => {
        setConfig((prev) => {
            const newArray = [...(prev[field] as string[])];
            newArray.splice(index, 1);
            return { ...prev, [field]: newArray };
        });
    };

    const handleMessageExampleChange = (
        pairIndex: number,
        messageIndex: 0 | 1,
        value: string
    ) => {
        setConfig((prev) => {
            const updatedExamples = [...prev.messageExamples];
            updatedExamples[pairIndex][messageIndex].content.text = value;
            return { ...prev, messageExamples: updatedExamples };
        });
    };

    const handleAddMessageExample = () => {
        setConfig((prev) => ({
            ...prev,
            messageExamples: [
                ...prev.messageExamples,
                [
                    { user: "{{user1}}", content: { text: "" } },
                    { user: prev.name, content: { text: "" } },
                ],
            ],
        }));
    };

    const handleRemoveMessageExample = (pairIndex: number) => {
        setConfig((prev) => {
            const updatedExamples = [...prev.messageExamples];
            updatedExamples.splice(pairIndex, 1);
            return { ...prev, messageExamples: updatedExamples };
        });
    };

    const handleCreate = async () => {
        console.log(
            language === "zh"
                ? "创建AI目标规划师Agent配置:"
                : "Creating AI Goal Planner Agent config:",
            config
        );

        const agentId = await elizaClient.createAgent(config);
        if (!agentId) {
            toast.error(
                language === "zh"
                    ? "创建AI目标规划师Agent失败"
                    : "Failed to create AI Goal Planner Agent"
            );
            return;
        }

        console.log(`create agent [${agentId}] for goal [${goalId}] success`);

        createAgentMutation(
            {
                goalId: Number(goalId),
                agentId: agentId,
                agentName: config.name,
                characterJson: JSON.stringify(config),
            },
            {
                onSuccess: () => {
                    toast.success(
                        language === "zh"
                            ? "AI目标规划师创建成功！"
                            : "AI Goal Planner created successfully!"
                    );
                    setOpen(false);

                    // 如果提供了回调，则调用
                    if (onAgentCreated) {
                        onAgentCreated();
                    }
                },
                onError: (error) => {
                    toast.error(
                        language === "zh"
                            ? `AI目标规划师创建失败: ${error.message}`
                            : `Failed to create AI Goal Planner: ${error.message}`
                    );
                },
            }
        );
    };

    return (
        <div className="flex justify-center mb-8">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white px-8 py-6 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        {language === "zh"
                            ? "创建我的专属AI目标规划师Agent"
                            : "Create My Personalized AI Goal Planner Agent"}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {language === "zh"
                                ? "创建AI目标规划师Agent"
                                : "Create AI Goal Planner Agent"}
                        </DialogTitle>
                        <DialogDescription>
                            {language === "zh"
                                ? "让我们开始创建你的个性化AI目标规划师。请填写以下信息："
                                : "Let's create your personalized AI Goal Planner. Please fill in the following information:"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        {/* 基本信息 */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">
                                {language === "zh"
                                    ? "基本信息"
                                    : "Basic Information"}
                            </h3>
                            <div className="grid gap-4">
                                <div className="grid grid-cols-6 items-center gap-4">
                                    <label
                                        htmlFor="name"
                                        className="text-left col-span-1"
                                    >
                                        {language === "zh" ? "名称" : "Name"}
                                    </label>
                                    <Input
                                        id="name"
                                        value={config.name}
                                        onChange={(e) =>
                                            handleChange("name", e.target.value)
                                        }
                                        className="col-span-5"
                                        placeholder={
                                            language === "zh"
                                                ? "给你的AI规划师起个名字"
                                                : "Give your AI Planner a name"
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 简介 */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">
                                {language === "zh" ? "简介(Bio)" : "Bio"}
                            </h3>
                            {config.bio.map((bio, index) => (
                                <div key={index} className="flex gap-2">
                                    <Textarea
                                        value={bio}
                                        onChange={(e) =>
                                            handleArrayChange(
                                                "bio",
                                                index,
                                                e.target.value
                                            )
                                        }
                                        className="flex-1"
                                        placeholder={
                                            language === "zh"
                                                ? "描述你的AI规划师"
                                                : "Describe your AI Planner"
                                        }
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            handleRemoveArrayItem("bio", index)
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                onClick={() => handleAddArrayItem("bio")}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {language === "zh" ? "添加简介" : "Add Bio"}
                            </Button>
                        </div>

                        {/* 背景故事 */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">
                                {language === "zh"
                                    ? "背景故事(Lore)"
                                    : "Background Story (Lore)"}
                            </h3>
                            {config.lore.map((lore, index) => (
                                <div key={index} className="flex gap-2">
                                    <Textarea
                                        value={lore}
                                        onChange={(e) =>
                                            handleArrayChange(
                                                "lore",
                                                index,
                                                e.target.value
                                            )
                                        }
                                        className="flex-1"
                                        placeholder={
                                            language === "zh"
                                                ? "描述AI规划师的背景故事"
                                                : "Describe the background story of the AI Planner"
                                        }
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            handleRemoveArrayItem("lore", index)
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                onClick={() => handleAddArrayItem("lore")}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {language === "zh"
                                    ? "添加背景故事"
                                    : "Add Background Story"}
                            </Button>
                        </div>

                        {/* 对话示例 */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">
                                {language === "zh"
                                    ? "对话示例(Message Examples)"
                                    : "Message Examples"}
                            </h3>
                            {config.messageExamples.map(
                                (example, pairIndex) => (
                                    <div
                                        key={pairIndex}
                                        className="space-y-2 p-4 border rounded-lg"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">
                                                {language === "zh"
                                                    ? "示例"
                                                    : "Example"}{" "}
                                                {pairIndex + 1}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleRemoveMessageExample(
                                                        pairIndex
                                                    )
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-right">
                                                    {language === "zh"
                                                        ? "用户"
                                                        : "User"}
                                                </label>
                                                <Textarea
                                                    value={
                                                        example[0].content.text
                                                    }
                                                    onChange={(e) =>
                                                        handleMessageExampleChange(
                                                            pairIndex,
                                                            0,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="col-span-3"
                                                    placeholder={
                                                        language === "zh"
                                                            ? "用户的问题"
                                                            : "User's question"
                                                    }
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-right">
                                                    {language === "zh"
                                                        ? "AI回复"
                                                        : "AI Reply"}
                                                </label>
                                                <Textarea
                                                    value={
                                                        example[1].content.text
                                                    }
                                                    onChange={(e) =>
                                                        handleMessageExampleChange(
                                                            pairIndex,
                                                            1,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="col-span-3"
                                                    placeholder={
                                                        language === "zh"
                                                            ? "AI的回复"
                                                            : "AI's reply"
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                            <Button
                                variant="outline"
                                onClick={handleAddMessageExample}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {language === "zh"
                                    ? "添加对话示例"
                                    : "Add Message Example"}
                            </Button>
                        </div>

                        {/* 性格特征 */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">
                                {language === "zh"
                                    ? "性格特征(Adjectives)"
                                    : "Adjectives"}
                            </h3>
                            {config.adjectives.map((adj, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={adj}
                                        onChange={(e) =>
                                            handleArrayChange(
                                                "adjectives",
                                                index,
                                                e.target.value
                                            )
                                        }
                                        className="flex-1"
                                        placeholder={
                                            language === "zh"
                                                ? "描述AI规划师的性格特征"
                                                : "Describe the personality traits of the AI Planner"
                                        }
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            handleRemoveArrayItem(
                                                "adjectives",
                                                index
                                            )
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                onClick={() => handleAddArrayItem("adjectives")}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {language === "zh"
                                    ? "添加性格特征"
                                    : "Add Adjectives"}
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            type="submit"
                            onClick={handleCreate}
                        >
                            {language === "zh" ? "创建" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
