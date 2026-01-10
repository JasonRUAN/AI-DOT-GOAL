import { useReadContract, useConfig } from "wagmi";
import { useGetOneGoal } from "./useGetOneGoal";
import { aiGoalContractConfig } from "@/constants/ContractConfig";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@/constants";
import { readContract } from "wagmi/actions";
import { GoalDetail, ProgressUpdateDetail } from "@/types/move";

export function useGetGoalProgressUpdates({ goalId }: { goalId: number }) {
    const { data: goalData } = useGetOneGoal({ goalId });
    const config = useConfig();

    // 从 goal 数据中获取 progressUpdateCounter
    const progressUpdateCounter = goalData
        ? Number((goalData as GoalDetail).progressUpdateCounter)
        : 0;

    console.log("🔍 [ProgressUpdates] Hook called with:", {
        goalId,
        goalData,
        progressUpdateCounter,
        hasGoalData: !!goalData,
    });

    return useQuery({
        queryKey: [
            QueryKey.GetGoalProgressUpdatesQueryKey,
            goalId,
            progressUpdateCounter,
        ],
        queryFn: async () => {
            console.log("📊 [ProgressUpdates] queryFn executing:", {
                progressUpdateCounter,
                goalId,
            });

            if (!progressUpdateCounter || progressUpdateCounter === 0) {
                console.log("⚠️ [ProgressUpdates] No updates to fetch, counter is 0");
                return [];
            }

            console.log(`🔄 [ProgressUpdates] Fetching ${progressUpdateCounter} updates...`);

            try {
                // const progressUpdatesArray: ProgressUpdateDetail[] = [];

                // 并行获取所有进度更新，使用 readContract 而不是 useReadContract
                const progressUpdatePromises = Array.from(
                    { length: progressUpdateCounter },
                    async (_, i) => {
                        console.log(`📥 [ProgressUpdates] Fetching update #${i + 1}/${progressUpdateCounter}`);
                        try {
                            const result = await readContract(config, {
                                address:
                                    aiGoalContractConfig.address as `0x${string}`,
                                abi: aiGoalContractConfig.abi,
                                functionName: "getProgressUpdate",
                                args: [Number(goalId), i + 1],
                            });

                            console.log(
                                `✅ [ProgressUpdates] Update #${i + 1} result:`,
                                result,
                            );

                            // 合约返回的是数组格式: [id, content, proofFileBlobId, creator, createdAt]
                            // 需要转换为对象格式
                            const [id, content, proofFileBlobId, creator, createdAt] = result as [
                                bigint,
                                string,
                                string,
                                string,
                                bigint,
                            ];

                            const update = {
                                id: Number(id),
                                content,
                                proofFileBlobId,
                                creator,
                                createdAt,
                            } as ProgressUpdateDetail;

                            console.log(`📦 [ProgressUpdates] Parsed update #${i + 1}:`, update);

                            return update;
                        } catch (error) {
                            console.error(`❌ [ProgressUpdates] 获取进度更新 ${i + 1} 失败:`, error);
                            return null;
                        }
                    },
                );

                const results = await Promise.all(progressUpdatePromises);
                console.log(`🎯 [ProgressUpdates] All promises resolved:`, results);

                // 过滤掉失败的请求
                const progressUpdatesArray = results.filter(
                    (result): result is ProgressUpdateDetail =>
                        result !== null,
                );

                console.log(`✨ [ProgressUpdates] Final filtered updates:`, {
                    count: progressUpdatesArray.length,
                    updates: progressUpdatesArray,
                });

                return progressUpdatesArray;
            } catch (err) {
                console.error("❌ [ProgressUpdates] 获取进度更新失败:", err);
                throw err instanceof Error
                    ? err
                    : new Error("获取进度更新失败");
            }
        },
        enabled: !!goalId && !!goalData && progressUpdateCounter > 0,
        staleTime: 0, // 始终视为过期，强制刷新
        refetchOnWindowFocus: true, // 启用窗口聚焦时自动刷新
    });
}

// 创建单独的 hook 来获取单个进度更新（使用 wagmi）
export function useGetProgressUpdate({
    goalId,
    updateId,
    enabled = true,
}: {
    goalId: string;
    updateId: number;
    enabled?: boolean;
}) {
    const {
        data: progressUpdateData,
        isPending,
        error,
    } = useReadContract({
        address: aiGoalContractConfig.address as `0x${string}`,
        abi: aiGoalContractConfig.abi,
        functionName: "getProgressUpdate",
        args: [Number(goalId), updateId],
        query: {
            enabled: enabled && !!goalId && updateId >= 0,
        },
    });

    if (!enabled || !goalId) {
        return {
            progressUpdateData: undefined,
            isPending: false,
            error: null,
        };
    }

    if (error) {
        return {
            progressUpdateData: undefined,
            isPending,
            error,
        };
    }

    if (isPending) {
        return {
            progressUpdateData: undefined,
            isPending,
            error: null,
        };
    }

    return {
        progressUpdateData: progressUpdateData as ProgressUpdateDetail,
        isPending,
        error: null,
    };
}
