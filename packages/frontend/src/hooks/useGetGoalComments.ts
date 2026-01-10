import { useReadContract, useConfig } from "wagmi";
import { useGetOneGoal } from "./useGetOneGoal";
import { aiGoalContractConfig } from "@/constants/ContractConfig";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@/constants";
import { readContract } from "wagmi/actions";
import { GoalDetail, CommentDetail } from "@/types/move";
import { customStringify } from "@/lib/tools";

export function useGetGoalComments({ goalId }: { goalId: number }) {
    const { data: goalData } = useGetOneGoal({ goalId });
    const config = useConfig();

    if (goalData) {
        console.log("Goal Data:", customStringify(goalData));
    }

    // 从 goal 数据中获取 commentCounter
    const commentCounter = goalData
        ? Number((goalData as GoalDetail).commentCounter)
        : 0;

    return useQuery({
        queryKey: [QueryKey.GetGoalCommentsQueryKey, goalId, commentCounter],
        queryFn: async () => {
            if (!commentCounter || commentCounter === 0) {
                return [];
            }

            try {
                // const commentsArray: CommentDetail[] = [];

                // 并行获取所有评论，使用 readContract 而不是 useReadContract
                const commentPromises = Array.from(
                    { length: commentCounter },
                    async (_, i) => {
                        try {
                            const result = await readContract(config, {
                                address:
                                    aiGoalContractConfig.address as `0x${string}`,
                                abi: aiGoalContractConfig.abi,
                                functionName: "getComment",
                                args: [goalId, i + 1],
                            });

                            console.log(
                                `#### result: ${customStringify(result)}`,
                            );

                            // 合约返回的是数组格式: [id, content, creator, createdAt]
                            // 需要转换为对象格式
                            const [id, content, creator, createdAt] = result as [
                                bigint,
                                string,
                                string,
                                bigint,
                            ];

                            return {
                                id: Number(id),
                                content,
                                creator,
                                createdAt,
                            } as CommentDetail;
                        } catch (error) {
                            console.error(`获取评论 ${i + 1} 失败:`, error);
                            return null;
                        }
                    },
                );

                const results = await Promise.all(commentPromises);

                // 过滤掉失败的请求
                const commentsArray = results.filter(
                    (result): result is CommentDetail => result !== null,
                );

                console.log("Filtered comments:", customStringify(commentsArray));

                return commentsArray;
            } catch (err) {
                console.error("获取评论失败:", err);
                throw err instanceof Error ? err : new Error("获取评论失败");
            }
        },
        enabled: !!goalId && !!goalData,
        staleTime: 30 * 1000, // 30秒内数据视为新鲜
        refetchOnWindowFocus: false, // 禁用窗口聚焦时自动刷新
    });
}

// 创建单独的 hook 来获取单个评论（使用 wagmi）
export function useGetComment({
    goalId,
    commentId,
    enabled = true,
}: {
    goalId: string;
    commentId: number;
    enabled?: boolean;
}) {
    const {
        data: commentData,
        isPending,
        error,
    } = useReadContract({
        address: aiGoalContractConfig.address as `0x${string}`,
        abi: aiGoalContractConfig.abi,
        functionName: "getComment",
        args: [Number(goalId), commentId],
        query: {
            enabled: enabled && !!goalId && commentId >= 0,
        },
    });

    if (!enabled || !goalId) {
        return {
            commentData: undefined,
            isPending: false,
            error: null,
        };
    }

    if (error) {
        return {
            commentData: undefined,
            isPending,
            error,
        };
    }

    if (isPending) {
        return {
            commentData: undefined,
            isPending,
            error: null,
        };
    }

    return {
        commentData: commentData as CommentDetail,
        isPending,
        error: null,
    };
}
