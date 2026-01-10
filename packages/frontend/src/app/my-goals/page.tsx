"use client";

import { GoalCard } from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { useGetMyGoals } from "@/hooks/useGetMyGoals";
import { Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";

export default function MyGoalsPage() {
    const router = useRouter();
    const { t, language } = useLanguage();

    const { data: goals, isLoading, refetch } = useGetMyGoals();
    const [activeTab, setActiveTab] = useState("active");
    const [isRefreshing, setIsRefreshing] = useState(false);

    console.log(">>>AAA", goals);

    const filteredGoals = goals?.filter((goal) => {
        if (!goal) return false;
        if (activeTab === "all") return true;
        const status = goal.status;
        switch (activeTab) {
            case "active":
                return status === 0;
            case "completed":
                return status === 1;
            case "failed":
                return status === 2;
            default:
                return true;
        }
    });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        if (refetch) {
            await refetch();
        }
        setTimeout(() => setIsRefreshing(false), 500);
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">{t("myGoals")}</h1>
                    <Button
                        onClick={handleRefresh}
                        variant="ghost"
                        size="icon"
                        disabled={isRefreshing}
                        className="relative"
                        title={
                            language === "zh"
                                ? "刷新目标列表"
                                : "Refresh goal list"
                        }
                    >
                        <RefreshCw
                            className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
                        />
                    </Button>
                </div>
                <Button
                    onClick={() => router.push("/create")}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    {t("createNewGoal")}
                </Button>
            </div>

            <Tabs
                defaultValue="active"
                className="mb-8"
                onValueChange={setActiveTab}
            >
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">
                        {language === "zh" ? "全部" : "All"}
                    </TabsTrigger>
                    <TabsTrigger value="active">{t("inProgress")}</TabsTrigger>
                    <TabsTrigger value="completed">
                        {t("completed")}
                    </TabsTrigger>
                    <TabsTrigger value="failed">{t("failed")}</TabsTrigger>
                </TabsList>
            </Tabs>

            {isLoading ? (
                <div className="flex flex-col justify-center items-center min-h-[200px] gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {language === "zh"
                            ? "正在加载目标列表..."
                            : "Loading goals..."}
                    </p>
                </div>
            ) : filteredGoals?.length === 0 ? (
                <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2">
                        {activeTab === "all"
                            ? language === "zh"
                                ? "还没有创建任何目标"
                                : "No goals created yet"
                            : activeTab === "active"
                              ? language === "zh"
                                  ? "没有进行中的目标"
                                  : "No goals in progress"
                              : activeTab === "completed"
                                ? language === "zh"
                                    ? "没有已完成的目标"
                                    : "No completed goals"
                                : language === "zh"
                                  ? "没有失败的目标"
                                  : "No failed goals"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {activeTab === "all"
                            ? language === "zh"
                                ? "创建你的第一个目标,开始你的自我提升之旅"
                                : "Create your first goal and start your self-improvement journey"
                            : language === "zh"
                              ? "继续努力,创建新的目标"
                              : "Keep going, create new goals"}
                    </p>
                    <Button
                        onClick={() => router.push("/create")}
                        variant="outline"
                        className="mx-auto"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        {language === "zh" ? "创建目标" : "Create Goal"}
                    </Button>
                </div>
            ) : (
                <div
                    className={`grid gap-6 ${
                        filteredGoals?.length === 1
                            ? "grid-cols-1 md:grid-cols-2"
                            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    }`}
                >
                    {filteredGoals
                        .filter((goal) => goal !== null)
                        .map((goal) => (
                            <GoalCard key={goal.id} goal={goal} />
                        ))}
                </div>
            )}
        </div>
    );
}
