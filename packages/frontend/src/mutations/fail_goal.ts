import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useWriteContract } from "wagmi";
import { aiGoalContractConfig } from "@/constants/ContractConfig";
import { QueryKey } from "@/constants";

export function useFailGoal() {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (goalId: string) => {
            if (!address) {
                throw new Error("You need to connect your wallet first pls!");
            }

            const result = await writeContractAsync({
                address: aiGoalContractConfig.address as `0x${string}`,
                abi: aiGoalContractConfig.abi,
                functionName: "failGoal",
                args: [Number(goalId)],
            });

            return result;
        },
        onError: (error) => {
            console.error("Failed to fail goal:", error);
            throw error;
        },
        onSuccess: (data, variables) => {
            console.log("Successfully failed goal:", data);

            // 使目标数据缓存失效
            queryClient.invalidateQueries({
                queryKey: [QueryKey.GetOneGoalQueryKey, variables],
            });

            // 使我的目标列表缓存失效
            queryClient.invalidateQueries({
                queryKey: [QueryKey.GetMyGoalsQueryKey],
            });

            // 使所有目标列表缓存失效
            queryClient.invalidateQueries({
                queryKey: [QueryKey.GetMultipleGoalsQueryKey],
            });

            // 无效化 wagmi 的 readContract 查询（关键！）
            queryClient.invalidateQueries({
                queryKey: ["readContract"],
            });
        },
    });
}
