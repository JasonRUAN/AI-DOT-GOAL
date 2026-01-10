"use client";

import React from "react";
import Link from "next/link";
import { DecodedEvent } from "@/hooks/useGetUserEvents";
import { useLanguage } from "@/providers/LanguageProvider";
import { ExternalLink, Coins } from "lucide-react";

interface EventListProps {
    events: DecodedEvent[];
    maxItems?: number;
}

export function EventList({ events, maxItems = 10 }: EventListProps) {
    const { t } = useLanguage();

    // 获取事件的 AIG 代币奖励数量
    const getAIGReward = (eventName: string): number => {
        const rewardMap: Record<string, number> = {
            GoalCreated: 100,
            WitnessConfirmed: 50,
            GoalCompleted: 100,
            GoalFailed: 100,
            CommentCreated: 10,
            ProgressUpdated: 10,
            AgentCreated: 200,
            AgentUpdated: 100,
        };
        return rewardMap[eventName] || 0;
    };

    // 渲染带有目标链接的文本
    const renderEventDescription = (event: DecodedEvent): React.ReactNode => {
        const args = event.args;
        const goalId = args.goalId?.toString();

        switch (event.eventName) {
            case "GoalCreated":
                return (
                    <span>
                        {t("createdGoal")}:{" "}
                        <span className="font-medium text-gray-800">
                            {args.title || ""}
                        </span>
                    </span>
                );
            case "GoalCompleted":
                return (
                    <span>
                        {t("completedGoal")}{" "}
                        {goalId && (
                            <Link
                                href={`/goals/${goalId}`}
                                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                            >
                                #{goalId}
                            </Link>
                        )}
                    </span>
                );
            case "WitnessConfirmed":
                return (
                    <span>
                        {t("witnessConfirmed")}{" "}
                        {goalId && (
                            <Link
                                href={`/goals/${goalId}`}
                                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                            >
                                #{goalId}
                            </Link>
                        )}
                    </span>
                );
            case "GoalFailed":
                return (
                    <span>
                        {t("goalFailed")}{" "}
                        {goalId && (
                            <Link
                                href={`/goals/${goalId}`}
                                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                            >
                                #{goalId}
                            </Link>
                        )}
                    </span>
                );
            case "AgentCreated":
                return (
                    <span>
                        {t("createdAgent")}:{" "}
                        <span className="font-medium text-gray-800">
                            {args.agentName || ""}
                        </span>
                    </span>
                );
            case "AgentUpdated":
                return (
                    <span>
                        {t("updatedAgent")}:{" "}
                        <span className="font-mono text-sm text-gray-600">
                            {args.agentId || ""}
                        </span>
                    </span>
                );
            case "CommentCreated":
                return (
                    <span>
                        {t("createdComment")} {t("onGoal")}{" "}
                        {goalId && (
                            <Link
                                href={`/goals/${goalId}`}
                                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                            >
                                #{goalId}
                            </Link>
                        )}
                    </span>
                );
            case "ProgressUpdated":
                return (
                    <span>
                        {t("updatedProgress")} {t("toGoal")}{" "}
                        {goalId && (
                            <Link
                                href={`/goals/${goalId}`}
                                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                            >
                                #{goalId}
                            </Link>
                        )}{" "}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {args.progressPercentage?.toString() || "0"}%
                        </span>
                    </span>
                );
            default:
                return event.eventName;
        }
    };

    // 获取事件类型的颜色
    const getEventColor = (eventName: string): string => {
        switch (eventName) {
            case "GoalCreated":
            case "AgentCreated":
                return "bg-blue-50 text-blue-600 border-blue-200";
            case "GoalCompleted":
                return "bg-green-50 text-green-600 border-green-200";
            case "WitnessConfirmed":
                return "bg-purple-50 text-purple-600 border-purple-200";
            case "GoalFailed":
                return "bg-red-50 text-red-600 border-red-200";
            case "ProgressUpdated":
                return "bg-yellow-50 text-yellow-600 border-yellow-200";
            case "CommentCreated":
                return "bg-indigo-50 text-indigo-600 border-indigo-200";
            case "AgentUpdated":
                return "bg-cyan-50 text-cyan-600 border-cyan-200";
            default:
                return "bg-gray-50 text-gray-600 border-gray-200";
        }
    };

    // 获取事件类型的翻译
    const getEventTypeText = (eventName: string): string => {
        const typeMap: Record<string, string> = {
            GoalCreated: t("eventGoalCreated") || "Goal Created",
            GoalCompleted: t("eventGoalCompleted") || "Goal Completed",
            WitnessConfirmed: t("eventWitnessConfirmed") || "Witness Confirmed",
            GoalFailed: t("eventGoalFailed") || "Goal Failed",
            AgentCreated: t("eventAgentCreated") || "Agent Created",
            AgentUpdated: t("eventAgentUpdated") || "Agent Updated",
            CommentCreated: t("eventCommentCreated") || "Comment Created",
            ProgressUpdated: t("eventProgressUpdated") || "Progress Updated",
        };
        return typeMap[eventName] || eventName;
    };

    if (events.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>{t("noRecentActivity")}</p>
            </div>
        );
    }

    const displayEvents = events.slice(0, maxItems);

    return (
        <div className="max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            <div className="space-y-3">
                {displayEvents.map((event) => {
                    const aigReward = getAIGReward(event.eventName);
                    
                    return (
                        <div
                            key={`${event.transactionHash}-${event.logIndex}`}
                            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-amber-200"
                        >
                            {/* 顶部：事件类型标签和奖励金额 */}
                            <div className="flex justify-between items-start mb-3">
                                <span
                                    className={`text-xs font-medium px-3 py-1 rounded-full border ${getEventColor(event.eventName)}`}
                                >
                                    {getEventTypeText(event.eventName)}
                                </span>
                                
                                {/* AIG 奖励徽章 - 突出显示 */}
                                {aigReward > 0 && (
                                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-400 rounded-full px-3 py-1.5 shadow-sm">
                                        <Coins className="w-4 h-4 text-amber-600" />
                                        <span className="text-sm font-bold text-amber-700">
                                            +{aigReward}
                                        </span>
                                        <span className="text-xs font-semibold text-amber-600">
                                            AIG
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* 事件描述 */}
                            <div className="text-sm text-gray-700 mb-3 leading-relaxed">
                                {renderEventDescription(event)}
                            </div>

                            {/* 底部：区块信息和交易链接 */}
                            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                                <span className="flex items-center gap-1">
                                    <span className="text-gray-400">
                                        {t("block") || "Block"}:
                                    </span>
                                    <span className="font-mono text-gray-600">
                                        {event.blockNumber.toString()}
                                    </span>
                                </span>
                                <a
                                    // href={`https://sepolia.explorer.testnet.ms/tx/${event.transactionHash}`}
                                    href="#"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700 hover:underline transition-colors"
                                >
                                    <span className="font-mono">
                                        {event.transactionHash.substring(0, 8)}...
                                        {event.transactionHash.substring(
                                            event.transactionHash.length - 6,
                                        )}
                                    </span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
