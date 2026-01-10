import { elizaClient } from "@/lib/elizaClient";
import type { ContentWithUser } from "@/types/eliza/message";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSendMessage(agentId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["send_message", agentId],
        mutationFn: ({
            message,
            selectedFile,
        }: {
            message: string;
            selectedFile?: File | null;
        }) => elizaClient.sendMessage(agentId, message, selectedFile),
        onSuccess: (newMessages: ContentWithUser[]) => {
            console.log(newMessages);
            queryClient.setQueryData(
                ["messages", agentId],
                (old: ContentWithUser[] = []) => [
                    // 过滤掉所有 isLoading 为 true 的旧消息，保留其他消息。
                    ...old.filter((msg) => !msg.isLoading),
                    // 将新消息映射为一个新的对象数组，并为每个消息添加一个 createdAt 属性，值为当前时间戳。
                    ...newMessages.map((msg) => ({
                        ...msg,
                        createdAt: Date.now(),
                    })),
                ]
            );
        },
        onError: (e) => {
            console.error(e);
        },
    });
}
