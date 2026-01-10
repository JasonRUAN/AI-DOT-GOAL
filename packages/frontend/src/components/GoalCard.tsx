"use client";

import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Coins, Users, ExternalLink } from "lucide-react";
import { GoalDetail } from "@/types/move";
import Link from "next/link";
import { ProgressUpdateDialog } from "@/components/ProgressUpdateDialog";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAccount } from "wagmi";

export function GoalCard({ goal }: { goal: GoalDetail }) {
    const { address } = useAccount();

    const { language } = useLanguage();
    const isCreator = goal.creator === address;

    const getStatusColor = (status: number) => {
        switch (status) {
            case 1:
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case 2:
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            default:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        }
    };

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

    return (
        <Card className="w-full backdrop-blur-sm bg-white/10 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{goal.title}</CardTitle>
                    <Badge className={getStatusColor(goal.status)}>
                        {getStatusText(goal.status)}
                    </Badge>
                </div>
                <CardDescription className="line-clamp-1">
                    {goal.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {goal.progressPercentage !== undefined && (
                        <>
                            <div className="flex justify-between text-sm">
                                <span>
                                    {language === "zh"
                                        ? "目标进度"
                                        : "Goal Progress"}
                                </span>
                                <span>{goal.progressPercentage}%</span>
                            </div>
                            <Progress
                                value={Number(goal.progressPercentage)}
                                className="h-2.5 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-600"
                            />
                        </>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                            {language === "zh" ? "截止日期: " : "Deadline: "}
                            {format(
                                new Date(Number(goal.deadline)),
                                "yyyy-MM-dd",
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4" />
                        <span>
                            {language === "zh" ? "保证金: " : "Stake: "}
                            {Number(goal.amount) / 10 ** 18} MINI
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                            {language === "zh"
                                ? `见证人: ${goal.witnesses?.length}人`
                                : `Witnesses: ${goal.witnesses?.length}`}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {goal.status !== 1 && isCreator && (
                        <ProgressUpdateDialog
                            goalId={goal.id}
                            currentProgress={Number(goal.progressPercentage) || 0}
                            onProgressUpdated={() => {
                                // 可以添加进度更新后的回调，如果需要
                            }}
                            isCreator={isCreator}
                        />
                    )}
                    <Button
                        className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 ${
                            goal.status !== 1 && isCreator
                                ? "sm:col-start-2"
                                : "col-span-full"
                        }`}
                        asChild
                    >
                        <Link
                            href={`/goals/${goal.id}`}
                            className="flex items-center justify-center"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {language === "zh" ? "查看详情" : "View Details"}
                        </Link>
                    </Button>
                </div>

                {goal.aiSuggestion && (
                    <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 overflow-hidden">
                                <h4 className="font-medium text-sm mb-1">
                                    {language === "zh"
                                        ? "AI 建议"
                                        : "AI Suggestion"}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 break-words whitespace-pre-line">
                                    {goal.aiSuggestion}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
