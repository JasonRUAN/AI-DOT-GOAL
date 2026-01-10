"use client";

import React from "react";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/LanguageProvider";
import { toast } from "sonner";
import { useGetMyStatistics } from "@/hooks/useGetMyStatistics";
import { aiGoalContractConfig } from "@/constants/ContractConfig";
import { useGetUserEvents } from "@/hooks/useGetUserEvents";
import { EventList } from "@/components/EventList";

export default function ProfilePage() {
    const { address, isConnected } = useAccount();
    const { t, isLoaded } = useLanguage();

    const { data: categorizedGoals } = useGetMyStatistics();

    // 获取用户事件
    const { data: userEvents = [], isLoading: isLoadingEvents } =
        useGetUserEvents(address);

    // 获取 AIG 代币合约地址
    const { data: aigBalance } = useReadContract({
        address: aiGoalContractConfig.address as `0x${string}`,
        abi: aiGoalContractConfig.abi,
        functionName: "getTokenBalance",
        args: [address as `0x${string}`],
    });

    console.log("aigBalance", aigBalance);
    console.log("userEvents", userEvents);

    // 计算总 AIG 奖励
    const calculateTotalRewards = () => {
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

        return userEvents.reduce((total, event) => {
            return total + (rewardMap[event.eventName] || 0);
        }, 0);
    };

    const totalRewards = calculateTotalRewards();

    // 获取MON余额
    const { data: monBalance } = useBalance({
        address: address,
    });

    // 根据地址生成固定的颜色
    const getRandomColor = (address: string) => {
        const colors = [
            "bg-blue-500",
            "bg-green-500",
            "bg-purple-500",
            "bg-pink-500",
            "bg-yellow-500",
            "bg-indigo-500",
        ];
        // 将地址转换为数字并取模
        const hash = address
            .split("")
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    // 获取地址的首字母作为头像的备选显示
    const getInitials = (address: string) => {
        return address.substring(address.length - 4).toUpperCase();
    };

    // 在语言加载完成前显示加载状态
    if (!isLoaded) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-2xl font-semibold mb-4">Loading...</h2>
                <p className="text-gray-500 mb-6">Please wait...</p>
            </div>
        );
    }

    if (!isConnected || !address) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-2xl font-semibold mb-4">
                    {t("connectWalletFirst")}
                </h2>
                <p className="text-gray-500 mb-6">{t("connectWalletDesc")}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">{t("profile")}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 用户基本信息卡片 */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>{t("accountInfo")}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src="" alt={address} />
                            <AvatarFallback
                                className={`text-xl ${getRandomColor(
                                    address,
                                )} text-white`}
                            >
                                {getInitials(address)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <h3 className="font-semibold">
                                {t("walletAddress")}
                            </h3>
                            <p className="text-sm text-gray-500 break-all mb-4">
                                {address}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    try {
                                        if (navigator && navigator.clipboard) {
                                            navigator.clipboard
                                                .writeText(address)
                                                .then(() => {
                                                    toast.success(
                                                        t("copySuccess"),
                                                    );
                                                    console.log(
                                                        "复制成功:",
                                                        address,
                                                    );
                                                })
                                                .catch((err) => {
                                                    console.error(
                                                        "复制失败:",
                                                        err,
                                                    );
                                                    toast.error(
                                                        t("copyError") ||
                                                            "复制失败",
                                                    );
                                                });
                                        } else {
                                            // console.error("剪贴板API不可用");
                                            // 回退方案：创建临时输入框
                                            const tempInput =
                                                document.createElement("input");
                                            tempInput.value = address;
                                            document.body.appendChild(
                                                tempInput,
                                            );
                                            tempInput.select();
                                            document.execCommand("copy");
                                            document.body.removeChild(
                                                tempInput,
                                            );
                                            toast.success(t("copySuccess"));
                                        }
                                    } catch (error) {
                                        console.error("复制过程出错:", error);
                                        toast.error(
                                            t("copyError") || "复制失败",
                                        );
                                    }
                                }}
                            >
                                {t("copyAddress")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 用户统计信息卡片 */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>{t("statistics")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium">
                                    {t("totalGoals")}
                                </h3>
                                <p className="text-3xl font-bold text-primary">
                                    {categorizedGoals?.total || 0}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium">
                                    {t("completedGoals")}
                                </h3>
                                <p className="text-3xl font-bold text-green-500">
                                    {categorizedGoals?.completed || 0}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium">
                                    {t("pendingGoals")}
                                </h3>
                                <p className="text-3xl font-bold text-yellow-500">
                                    {categorizedGoals?.active || 0}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium">
                                    {t("failedGoals")}
                                </h3>
                                <p className="text-3xl font-bold text-red-500">
                                    {categorizedGoals?.failed || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 钱包余额卡片 */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>{t("balance")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium">PAS</h3>
                                <p className="text-3xl font-bold text-primary">
                                    {monBalance
                                        ? (() => {
                                              const num =
                                                  Number(monBalance.value) /
                                                  10 ** 18;
                                              if (num === 0) return "0";
                                              if (num >= 0.01)
                                                  return num.toFixed(2);
                                              if (num >= 0.000001)
                                                  return num.toFixed(6);
                                              return num.toExponential(2);
                                          })()
                                        : "-"}
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg border-2 border-amber-300 shadow-sm">
                                <h3 className="text-lg font-medium text-amber-800">
                                    AIG
                                </h3>
                                <p className="text-3xl font-bold text-amber-700">
                                    {aigBalance
                                        ? (() => {
                                              const num =
                                                  Number(aigBalance) / 10 ** 18;
                                              if (num === 0) return "0";
                                              if (num >= 0.01)
                                                  return num.toFixed(2);
                                              if (num >= 0.000001)
                                                  return num.toFixed(6);
                                              return num.toExponential(2);
                                          })()
                                        : "-"}
                                </p>
                            </div>

                            {/* 最近奖励统计 */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-sm font-medium text-green-700">
                                        {t("recentRewards") || "近期奖励"}
                                    </h3>
                                    <span className="text-xs text-green-600">
                                        ({userEvents.length} {t("events") || "事件"})
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-bold text-green-700">
                                        +{totalRewards}
                                    </p>
                                    <span className="text-lg font-semibold text-green-600">
                                        AIG
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 最近活动事件卡片 */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>{t("recentActivity")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingEvents ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>{t("loading") || "Loading..."}</p>
                            </div>
                        ) : (
                            <EventList events={userEvents} maxItems={10} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
