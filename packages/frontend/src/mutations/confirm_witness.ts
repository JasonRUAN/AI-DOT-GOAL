import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useWriteContract } from "wagmi";
import { aiGoalContractConfig } from "@/constants/ContractConfig";
import { QueryKey } from "@/constants";

export function useConfirmWitness() {
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
                functionName: "confirmWitness",
                args: [Number(goalId)],
            });

            return result;
        },
        onError: (error) => {
            console.error("Failed to confirm witness:", error);
            throw error;
        },
        onSuccess: (data, variables) => {
            console.log("Successfully confirmed witness:", data);

            // 使目标数据缓存失效，以获取最新的见证状态
            queryClient.invalidateQueries({
                queryKey: [QueryKey.GetOneGoalQueryKey, variables],
            });

            // 使多个目标查询缓存失效，以更新目标列表
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
