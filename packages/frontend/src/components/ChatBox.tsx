"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSendMessage } from "@/mutations/sendMessage";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/LanguageProvider";

interface ChatBoxProps {
    goalId: string;
    agentId: string;
}

interface ChatMessage {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: number;
    isTyping?: boolean;
}

export function ChatBox({ goalId, agentId }: ChatBoxProps) {
    const [message, setMessage] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const sendMessageMutation = useSendMessage(agentId);
    const { language } = useLanguage();

    // 滚动到最新消息
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    // 模拟初始消息和消息接收
    useEffect(() => {
        // 添加一条欢迎消息，并包含目标ID
        setChatMessages([
            {
                id: `agent-welcome`,
                content:
                    language === "zh"
                        ? `你好！我是您的AI目标规划师，请问有什么我能帮到您？`
                        : `Hello! I'm your AI Goal Planner. How can I help you?`,
                isUser: false,
                timestamp: Date.now(),
            },
        ]);
    }, [goalId, language]);

    const simulateTyping = (text: string, onComplete: () => void) => {
        setIsTyping(true);

        // 添加一个正在输入的占位消息
        const typingMessageId = `agent-typing-${Date.now()}`;
        setChatMessages((prev) => [
            ...prev,
            {
                id: typingMessageId,
                content: "",
                isUser: false,
                timestamp: Date.now(),
                isTyping: true,
            },
        ]);

        // 模拟打字延迟 - 根据消息长度
        const typingDelay = Math.min(1000, Math.max(300, text.length * 10));

        setTimeout(() => {
            // 移除打字占位消息并添加完整消息
            setChatMessages((prev) =>
                prev.filter((msg) => msg.id !== typingMessageId)
            );
            onComplete();
            setIsTyping(false);
        }, typingDelay);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || sendMessageMutation.isPending || isTyping)
            return;

        // 添加用户消息到对话列表
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            content: message,
            isUser: true,
            timestamp: Date.now(),
        };

        setChatMessages((prev) => [...prev, userMessage]);

        // 如果是测试模式，直接生成一个模拟回复
        const isTestMode = !agentId || agentId === "undefined";

        if (isTestMode) {
            const mockResponse =
                language === "zh"
                    ? `收到你关于目标#${goalId}的消息: "${message}"。我会帮你制定计划来实现这个目标！`
                    : `Received your message about goal #${goalId}: "${message}". I'll help you create a plan to achieve this goal!`;

            simulateTyping(mockResponse, () => {
                setChatMessages((prev) => [
                    ...prev,
                    {
                        id: `agent-mock-${Date.now()}`,
                        content: mockResponse,
                        isUser: false,
                        timestamp: Date.now(),
                    },
                ]);
            });

            setMessage("");
            return;
        }

        // 真实模式：调用useSendMessage发送消息
        sendMessageMutation.mutate(
            { message },
            {
                onSuccess: (newMessages) => {
                    // 处理所有回复消息
                    if (newMessages.length > 0) {
                        const processedContent = newMessages
                            .map((msg) => msg.text)
                            .join("\n\n");

                        simulateTyping(processedContent, () => {
                            setChatMessages((prev) => [
                                ...prev,
                                {
                                    id: `agent-${Date.now()}-${Math.random()
                                        .toString(36)
                                        .substring(2, 9)}`,
                                    content: processedContent,
                                    isUser: false,
                                    timestamp: Date.now(),
                                },
                            ]);
                        });
                    }
                    toast.success(
                        language === "zh" ? "消息已发送" : "Message sent"
                    );
                },
                onError: () => {
                    const errorContent =
                        language === "zh"
                            ? `抱歉，我无法处理你关于目标#${goalId}的请求。请稍后再试。`
                            : `Sorry, I couldn't process your request for goal #${goalId}. Please try again later.`;

                    simulateTyping(errorContent, () => {
                        setChatMessages((prev) => [
                            ...prev,
                            {
                                id: `agent-error-${Date.now()}`,
                                content: errorContent,
                                isUser: false,
                                timestamp: Date.now(),
                            },
                        ]);
                    });

                    toast.error(
                        language === "zh"
                            ? "发送消息失败"
                            : "Failed to send message"
                    );
                },
            }
        );

        setMessage("");
    };

    // 处理键盘快捷键
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e as unknown as React.FormEvent);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-2 p-2 text-sm font-medium text-center bg-slate-100 dark:bg-slate-800 rounded-lg">
                {language === "zh"
                    ? "与AI目标规划师的对话"
                    : "Conversation with AI Goal Planner"}
            </div>

            {/* 对话内容展示区 */}
            <div
                className="flex-grow mb-4 space-y-3 overflow-y-auto p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 h-[350px]"
                ref={chatContainerRef}
            >
                {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        {language === "zh"
                            ? "发送消息开始对话..."
                            : "Send a message to start the conversation..."}
                    </div>
                ) : (
                    chatMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${
                                msg.isUser ? "justify-end" : "justify-start"
                            } animate-in fade-in slide-in-from-bottom-3 duration-300`}
                        >
                            {/* 非用户消息显示AI头像 */}
                            {!msg.isUser && (
                                <div className="flex-shrink-0 mr-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                                        <Bot size={16} />
                                    </div>
                                </div>
                            )}

                            <div
                                className={cn(
                                    "max-w-[75%] p-3 rounded-lg",
                                    msg.isUser
                                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-tr-none"
                                        : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-tl-none",
                                    msg.isTyping && "animate-pulse"
                                )}
                            >
                                <div className="text-sm break-words">
                                    {msg.isTyping ? (
                                        <div className="flex items-center space-x-1">
                                            <div
                                                className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: "0ms",
                                                }}
                                            ></div>
                                            <div
                                                className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: "150ms",
                                                }}
                                            ></div>
                                            <div
                                                className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: "300ms",
                                                }}
                                            ></div>
                                        </div>
                                    ) : (
                                        msg.content
                                            .split("\n")
                                            .map((line, i) => (
                                                <p
                                                    key={i}
                                                    className={
                                                        i > 0 ? "mt-2" : ""
                                                    }
                                                >
                                                    {line}
                                                </p>
                                            ))
                                    )}
                                </div>
                                <div className="text-xs opacity-70 mt-1 text-right">
                                    {new Date(msg.timestamp).toLocaleTimeString(
                                        [],
                                        { hour: "2-digit", minute: "2-digit" }
                                    )}
                                </div>
                            </div>

                            {/* 用户消息显示用户头像 */}
                            {msg.isUser && (
                                <div className="flex-shrink-0 ml-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white">
                                        <User size={16} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form
                onSubmit={handleSendMessage}
                className="flex gap-2 sticky bottom-0 bg-white dark:bg-slate-950 pt-2"
            >
                <Input
                    type="text"
                    placeholder={
                        isTyping
                            ? language === "zh"
                                ? "AI正在回复..."
                                : "AI is responding..."
                            : language === "zh"
                            ? "输入消息..."
                            : "Type a message..."
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                    disabled={sendMessageMutation.isPending || isTyping}
                />
                <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    disabled={
                        sendMessageMutation.isPending ||
                        isTyping ||
                        !message.trim()
                    }
                >
                    {sendMessageMutation.isPending || isTyping ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="mr-2 h-4 w-4" />
                    )}
                    {sendMessageMutation.isPending
                        ? language === "zh"
                            ? "思考中..."
                            : "Thinking..."
                        : isTyping
                        ? language === "zh"
                            ? "AI回复中..."
                            : "AI responding..."
                        : language === "zh"
                        ? "发送"
                        : "Send"}
                </Button>
            </form>
        </div>
    );
}
