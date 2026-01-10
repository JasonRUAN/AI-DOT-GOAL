"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    HomeIcon,
    PlusCircleIcon,
    UserGroupIcon,
    TrophyIcon,
    ListBulletIcon,
    LanguageIcon,
    UserIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/providers/LanguageProvider";
import { ConnectKitButton } from "connectkit";

interface NavItem {
    key: string;
    path: string;
    icon: React.ReactNode;
}

export default function Sidebar() {
    const pathname = usePathname();
    const { t, language, setLanguage, isLoaded } = useLanguage();

    const navItems: NavItem[] = [
        {
            key: "home",
            path: "/",
            icon: <HomeIcon className="w-6 h-6" />,
        },
        {
            key: "createGoal",
            path: "/create",
            icon: <PlusCircleIcon className="w-6 h-6" />,
        },
        {
            key: "myGoals",
            path: "/my-goals",
            icon: <TrophyIcon className="w-6 h-6" />,
        },
        {
            key: "witnessGoals",
            path: "/witness-goals",
            icon: <UserGroupIcon className="w-6 h-6" />,
        },
        {
            key: "allGoals",
            path: "/all-goals",
            icon: <ListBulletIcon className="w-6 h-6" />,
        },
        {
            key: "profile",
            path: "/profile",
            icon: <UserIcon className="w-6 h-6" />,
        },
    ];

    // 切换语言
    const toggleLanguage = () => {
        setLanguage(language === "zh" ? "en" : "zh");
    };

    // 如果语言还没有加载完成，显示默认内容
    if (!isLoaded) {
        return (
            <div className="flex flex-col h-screen bg-white border-r border-gray-200 w-64 fixed left-0 top-0">
                {/* Logo 区域 */}
                <div className="flex items-center justify-center h-16 border-b border-gray-200">
                    <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 text-3xl font-bold">
                        AI GOAL
                    </h1>
                </div>

                {/* 导航菜单 */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-2 px-3">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        pathname === item.path
                                            ? "bg-primary text-white"
                                            : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {item.icon}
                                    <span className="ml-3">{item.key}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* 底部区域 */}
                <div className="border-t border-gray-200 p-4">
                    {/* 语言切换开关 */}
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 w-full"
                        >
                            <LanguageIcon className="w-6 h-6" />
                            <span className="ml-3">language</span>
                        </button>
                    </div>

                    {/* 钱包连接 */}
                    <div className="flex justify-center items-center">
                        <ConnectKitButton />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-white border-r border-gray-200 w-64 fixed left-0 top-0">
            {/* Logo 区域 */}
            <div className="flex items-center justify-center h-16 border-b border-gray-200">
                <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 text-3xl font-bold">
                    AI GOAL
                </h1>
            </div>

            {/* 导航菜单 */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-2 px-3">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                href={item.path}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    pathname === item.path
                                        ? "bg-primary text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {item.icon}
                                <span className="ml-3">{t(item.key)}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* 底部区域 */}
            <div className="border-t border-gray-200 p-4">
                {/* 语言切换开关 */}
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 w-full"
                    >
                        <LanguageIcon className="w-6 h-6" />
                        <span className="ml-3">{t("language")}</span>
                    </button>
                </div>

                {/* 钱包连接 */}
                <div className="flex justify-center items-center">
                    <ConnectKitButton />
                </div>
            </div>
        </div>
    );
}
