import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { aiGoalContractConfig } from "@/constants/ContractConfig";
import { QueryKey } from "@/constants";
import { useState, useEffect } from "react";

export function useCompleteGoal() {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const queryClient = useQueryClient();
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const [goalIdForRefresh, setGoalIdForRefresh] = useState<string | undefined>();

    // 等待交易确认
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const mutation = useMutation({
        mutationFn: async (goalId: string) => {
            if (!address) {
                throw new Error("You need to connect your wallet first pls!");
            }

            const hash = await writeContractAsync({
                address: aiGoalContractConfig.address as `0x${string}`,
                abi: aiGoalContractConfig.abi,
                functionName: "completeGoal",
                args: [Number(goalId)],
            });

            // 保存交易哈希和goalId用于等待确认后刷新
            setTxHash(hash);
            setGoalIdForRefresh(goalId);

            return { hash, goalId };
        },
        onError: (error) => {
            console.error("Failed to complete goal:", error);
            setTxHash(undefined);
            setGoalIdForRefresh(undefined);
            throw error;
        },
    });

    // 当交易确认后，刷新数据
    useEffect(() => {
        if (isConfirmed && txHash && goalIdForRefresh) {
            console.log("✅ [useCompleteGoal] Transaction confirmed, invalidating queries...");
            
            // 使目标详情缓存失效，以获取最新状态
            queryClient.invalidateQueries({
                queryKey: [QueryKey.GetOneGoalQueryKey, goalIdForRefresh],
            });

            // 使我的目标列表缓存失效
            queryClient.invalidateQueries({
                queryKey: [QueryKey.GetMyGoalsQueryKey],
            });

            // 使多个目标查询缓存失效
            queryClient.invalidateQueries({
                queryKey: [QueryKey.GetMultipleGoalsQueryKey],
            });

            // 无效化 wagmi 的 readContract 查询（关键！）
            queryClient.invalidateQueries({
                queryKey: ["readContract"],
            });

            // 重置状态
            setTxHash(undefined);
            setGoalIdForRefresh(undefined);
        }
    }, [isConfirmed, txHash, goalIdForRefresh, queryClient]);

    return {
        ...mutation,
        isPending: mutation.isPending || isConfirming,
        isConfirming,
        isConfirmed,
    };
}
