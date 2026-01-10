"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

type Language = "zh" | "en";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
    undefined
);

// 定义翻译类型
interface TranslationDict {
    [key: string]: string;
}

interface Translations {
    zh: TranslationDict;
    en: TranslationDict;
}

// 中英文翻译
const translations: Translations = {
    zh: {
        // 侧边栏
        home: "首页",
        createGoal: "创建目标",
        myGoals: "我的目标",
        witnessGoals: "见证目标",
        allGoals: "所有目标",
        profile: "个人中心",
        language: "Language (EN)",

        // 按钮和通用文本
        submit: "提交",
        cancel: "取消",
        confirm: "确认",
        edit: "编辑",
        delete: "删除",
        save: "保存",
        loading: "加载中...",
        success: "成功",
        error: "错误",
        welcome: "欢迎使用 AI DOT GOAL",
        back: "返回",
        next: "下一步",

        // 用户档案页面
        accountInfo: "账户信息",
        walletAddress: "钱包地址",
        copyAddress: "复制地址",
        copySuccess: "地址已复制到剪贴板",
        copyError: "复制失败，请手动复制",
        statistics: "统计数据",
        totalGoals: "目标总数",
        completedGoals: "已完成目标",
        pendingGoals: "进行中目标",
        failedGoals: "失败目标",
        balance: "余额",
        recentActivity: "奖励事件",
        noRecentActivity: "暂无奖励事件",
        connectWalletFirst: "请先连接钱包",
        connectWalletDesc: "连接钱包以查看您的个人信息",

        // 目标相关
        goalTitle: "目标标题",
        goalDescription: "目标描述",
        deadline: "截止日期",
        reward: "奖励",
        penalty: "惩罚",
        witness: "见证人",
        progress: "进度",
        completed: "已完成",
        inProgress: "进行中",
        failed: "未完成",
        createNewGoal: "创建新目标",

        // 表单提示
        titleRequired: "请输入目标标题",
        descriptionRequired: "请输入目标描述",
        deadlineRequired: "请选择截止日期",

        // 连接钱包
        connectWallet: "连接钱包",
        disconnectWallet: "断开钱包连接",
        walletConnected: "钱包已连接",
        walletDisconnected: "钱包未连接",

        rewardAmount: "奖励金额",
        rewardMethod: "奖励操作",

        // 事件相关
        eventGoalCreated: "创建目标",
        eventGoalCompleted: "完成目标",
        eventWitnessConfirmed: "见证确认",
        eventGoalFailed: "目标失败",
        eventAgentCreated: "创建代理",
        eventAgentUpdated: "更新代理",
        eventCommentCreated: "发表评论",
        eventProgressUpdated: "更新进度",
        createdGoal: "创建了目标",
        completedGoal: "完成了目标",
        witnessConfirmed: "确认了见证目标",
        goalFailed: "目标失败",
        createdAgent: "创建了代理",
        updatedAgent: "更新了代理",
        createdComment: "发表了评论于",
        updatedProgress: "更新了进度",
        onGoal: "于目标",
        toGoal: "到目标",
        block: "区块",
        recentRewards: "近期奖励",
        events: "事件",
    },
    en: {
        // 侧边栏
        home: "Home",
        createGoal: "Create Goal",
        myGoals: "My Goals",
        witnessGoals: "Witness Goals",
        allGoals: "All Goals",
        profile: "Profile",
        language: "语言 (中)",

        // 按钮和通用文本
        submit: "Submit",
        cancel: "Cancel",
        confirm: "Confirm",
        edit: "Edit",
        delete: "Delete",
        save: "Save",
        loading: "Loading...",
        success: "Success",
        error: "Error",
        welcome: "Welcome to AI DOT GOAL",
        back: "Back",
        next: "Next",

        // 用户档案页面
        accountInfo: "Account Info",
        walletAddress: "Wallet Address",
        copyAddress: "Copy Address",
        copySuccess: "Address copied to clipboard",
        copyError: "Copy failed, please copy manually",
        statistics: "Statistics",
        totalGoals: "Total Goals",
        completedGoals: "Completed Goals",
        pendingGoals: "Pending Goals",
        failedGoals: "Failed Goals",
        balance: "Balance",
        recentActivity: "Reward Events",
        noRecentActivity: "No reward events",
        connectWalletFirst: "Please Connect Wallet First",
        connectWalletDesc:
            "Connect your wallet to view your profile information",

        // 目标相关
        goalTitle: "Goal Title",
        goalDescription: "Goal Description",
        deadline: "Deadline",
        reward: "Reward",
        penalty: "Penalty",
        witness: "Witness",
        progress: "Progress",
        completed: "Completed",
        inProgress: "In Progress",
        failed: "Failed",
        createNewGoal: "Create New Goal",

        // 表单提示
        titleRequired: "Please enter a goal title",
        descriptionRequired: "Please enter a goal description",
        deadlineRequired: "Please select a deadline",

        // 连接钱包
        connectWallet: "Connect Wallet",
        disconnectWallet: "Disconnect Wallet",
        walletConnected: "Wallet Connected",
        walletDisconnected: "Wallet Disconnected",

        rewardAmount: "Reward Amount",
        rewardMethod: "Reward Method",

        // 事件相关
        eventGoalCreated: "Goal Created",
        eventGoalCompleted: "Goal Completed",
        eventWitnessConfirmed: "Witness Confirmed",
        eventGoalFailed: "Goal Failed",
        eventAgentCreated: "Agent Created",
        eventAgentUpdated: "Agent Updated",
        eventCommentCreated: "Comment Created",
        eventProgressUpdated: "Progress Updated",
        createdGoal: "Created goal",
        completedGoal: "Completed goal",
        witnessConfirmed: "Confirmed witness for goal",
        goalFailed: "Goal failed",
        createdAgent: "Created agent",
        updatedAgent: "Updated agent",
        createdComment: "Commented on",
        updatedProgress: "Updated progress for",
        onGoal: "on goal",
        toGoal: "to goal",
        block: "Block",
        recentRewards: "Recent Rewards",
        events: "Events",
    },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    // 首先尝试从本地存储获取语言设置，默认为中文
    const [language, setLanguageState] = useState<Language>("zh");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // 确保代码只在客户端执行
        if (typeof window !== "undefined") {
            // 获取本地存储的语言设置
            const savedLanguage = localStorage.getItem("language") as Language;
            if (
                savedLanguage &&
                (savedLanguage === "zh" || savedLanguage === "en")
            ) {
                setLanguageState(savedLanguage);
            }
            setIsLoaded(true);
        }
    }, []);

    // 设置语言并保存到本地存储
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        if (typeof window !== "undefined") {
            localStorage.setItem("language", lang);
        }
    };

    // 翻译函数
    const t = (key: string): string => {
        return translations[language as keyof Translations][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isLoaded }}>
            {children}
        </LanguageContext.Provider>
    );
}

// 创建一个自定义钩子，方便在组件中使用
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
