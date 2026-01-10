import { QueryKey } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { GoalDetail } from "@/types/move";
import { aiGoalContractConfig } from "@/constants/ContractConfig";

export function useGetMultipleGoals({ goalIds }: { goalIds: string[] }) {
    const publicClient = usePublicClient();

    return useQuery({
        queryKey: [QueryKey.GetMultipleGoalsQueryKey, goalIds],
        queryFn: async () => {
            if (!publicClient) throw new Error("Public client not found");

            const promises = goalIds.map(async (goalId) => {
                try {
                    const result = (await publicClient.readContract({
                        address: aiGoalContractConfig.address as `0x${string}`,
                        abi: aiGoalContractConfig.abi,
                        functionName: "getGoal",
                        args: [Number(goalId)],
                    })) as GoalDetail;

                    return result;
                } catch (error) {
                    console.error(`Failed to fetch goal ${goalId}:`, error);
                    return null;
                }
            });

            return Promise.all(promises);
        },
        enabled: goalIds.length > 0 && !!publicClient,
        staleTime: 2000, // 2秒内使用缓存，避免过于频繁请求
        refetchOnMount: true, // 组件挂载时刷新
        refetchOnWindowFocus: true, // 窗口聚焦时刷新
        refetchInterval: 8000, // 每8秒自动轮询一次（从5秒改为8秒，进一步减少请求）
        refetchIntervalInBackground: false, // 后台不轮询
        // select: (data: (GetGoalReturnType | null)[]) => {
        //     return data.map((goalData) => {
        //         if (!goalData) return null;

        //         const {
        //             id,
        //             title,
        //             description,
        //             deadline,
        //             amount,
        //             creator,
        //             witnesses,
        //             status,
        //         } = goalData;

        //         return {
        //             id,
        //             title,
        //             description,
        //             deadline,
        //             amount,
        //             creator,
        //             witnesses,
        //             status,
        //         } as GoalFields;
        //     });
        // },
    });
}
