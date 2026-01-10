"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalCard } from "@/components/goal-card";
import {
    ArrowRight,
    Target,
    Users,
    Award,
    Shield,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";

export default function Home() {
    const { language } = useLanguage();

    // 创建翻译内容
    const featureContent = {
        zh: [
            {
                id: "feature-1",
                icon: <Target className="h-10 w-10 text-blue-500" />,
                title: "设定目标",
                description: "创建你想要实现的小目标，借助AI帮你规划完成路径",
            },
            {
                id: "feature-2",
                icon: <Sparkles className="h-10 w-10 text-pink-500" />,
                title: "AI规划",
                description: "获取AI规划师的个性化建议，帮助你更好地实现目标",
            },
            {
                id: "feature-3",
                icon: <Users className="h-10 w-10 text-purple-500" />,
                title: "邀请见证人",
                description: "邀请朋友作为你目标的见证人，共同见证你的成长",
            },
            {
                id: "feature-4",
                icon: <Shield className="h-10 w-10 text-green-500" />,
                title: "锁定保证金",
                description: "通过智能合约锁定保证金，确保你对目标的承诺",
            },
            {
                id: "feature-5",
                icon: <Award className="h-10 w-10 text-yellow-500" />,
                title: "完成验证",
                description: "目标完成后，见证人投票确认，你将收回保证金",
            },
        ],
        en: [
            {
                id: "feature-1",
                icon: <Target className="h-10 w-10 text-blue-500" />,
                title: "Set Goals",
                description:
                    "Create the goals you want to achieve with AI-assisted planning",
            },
            {
                id: "feature-2",
                icon: <Sparkles className="h-10 w-10 text-pink-500" />,
                title: "AI Planning",
                description:
                    "Get personalized advice from AI planner to help you achieve your goals",
            },
            {
                id: "feature-3",
                icon: <Users className="h-10 w-10 text-purple-500" />,
                title: "Invite Witnesses",
                description:
                    "Invite friends as witnesses to your goals and witness your growth",
            },
            {
                id: "feature-4",
                icon: <Shield className="h-10 w-10 text-green-500" />,
                title: "Lock Deposit",
                description:
                    "Lock deposits through smart contracts to ensure your commitment",
            },
            {
                id: "feature-5",
                icon: <Award className="h-10 w-10 text-yellow-500" />,
                title: "Completion Verification",
                description:
                    "After completion, witnesses vote to confirm, and you'll get your deposit back",
            },
        ],
    };

    const goalContent = {
        zh: [
            {
                id: "goal-1",
                title: "每天跑步5公里",
                duration: "30天",
                stake: "1 PAS",
                witnesses: 3,
                status: "进行中",
                progress: 40,
            },
            {
                id: "goal-2",
                title: "完成第19期Polkadot技术开发课程",
                duration: "60天",
                stake: "2 PAS",
                witnesses: 2,
                status: "进行中",
                progress: 75,
            },
            {
                id: "goal-3",
                title: "减重20公斤",
                duration: "90天",
                stake: "3 PAS",
                witnesses: 4,
                status: "已完成",
                progress: 100,
            },
        ],
        en: [
            {
                id: "goal-1",
                title: "Run 5km every day",
                duration: "30 days",
                stake: "1 PAS",
                witnesses: 3,
                status: "In Progress",
                progress: 40,
            },
            {
                id: "goal-2",
                title: "Complete 19th Polkadot Development Course",
                duration: "60 days",
                stake: "2 PAS",
                witnesses: 2,
                status: "In Progress",
                progress: 75,
            },
            {
                id: "goal-3",
                title: "Lose 20kg",
                duration: "90 days",
                stake: "3 PAS",
                witnesses: 4,
                status: "Completed",
                progress: 100,
            },
        ],
    };

    // 根据当前语言选择内容
    const features = featureContent[language];
    const goals = goalContent[language];

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Hero Section */}
            <section className="flex flex-col items-center text-center mb-20">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight relative">
                        {language === "zh" ? (
                            <>
                                设定目标，
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                                    兑现承诺
                                </span>
                            </>
                        ) : (
                            <>
                                Set Goals,
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                                    Keep Promises
                                </span>
                            </>
                        )}
                    </h1>
                </div>
                <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                    {language === "zh"
                        ? "通过AI规划、质押机制、社交见证，让你的每一个目标都能顺利达成"
                        : "Achieve your goals with AI planning, staking mechanism and social witness"}
                </p>
                <div className="mt-10 flex flex-wrap gap-4 justify-center">
                    <Link href="/create">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                            {language === "zh"
                                ? "开始设定目标"
                                : "Start Setting Goals"}{" "}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <Button size="lg" variant="outline">
                        {language === "zh" ? "了解更多" : "Learn More"}
                    </Button>
                </div>
            </section>

            {/* Features Section */}
            <section className="mb-20">
                <h2 className="text-3xl font-bold text-center mb-12">
                    {language === "zh" ? "如何运作" : "How It Works"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {features.map((feature) => (
                        <Card
                            key={feature.id}
                            className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700"
                        >
                            <CardHeader>
                                <div className="mb-4">{feature.icon}</div>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Example Goals Section */}
            <section className="mb-20">
                <h2 className="text-3xl font-bold text-center mb-12">
                    {language === "zh" ? "热门目标展示" : "Popular Goals"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {goals.map((goal) => (
                        <GoalCard key={goal.id} goal={goal} />
                    ))}
                </div>
                <div className="text-center mt-10">
                    <Link href="/all-goals">
                        <Button variant="outline">
                            {language === "zh"
                                ? "查看更多目标"
                                : "View More Goals"}{" "}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
                <div className="relative px-6 py-16 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        {language === "zh"
                            ? "准备好实现你的目标了吗？"
                            : "Ready to achieve your goals?"}
                    </h2>
                    <p className="text-xl mb-10 max-w-2xl mx-auto">
                        {language === "zh"
                            ? "加入我们的平台，通过AI技术、区块链技术和社交激励，让你的每一个目标都能顺利达成。"
                            : "Join our platform and achieve your goals with AI technology, blockchain technology and social incentives."}
                    </p>
                    <Link href="/create">
                        <Button
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-gray-100"
                        >
                            {language === "zh" ? "立即开始" : "Start Now"}{" "}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
