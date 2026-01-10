import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { aiGoalContractConfig } from "@/constants/ContractConfig";
import { QueryKey } from "@/constants";
import { useState, useEffect } from "react";

interface UpdateProgressInfo {
    goalId: number;
    content: string;
    percentage: number;
    proofFileBlobId: string;
}

export function useUpdateProgress() {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const queryClient = useQueryClient();
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const [goalIdForRefresh, setGoalIdForRefresh] = useState<number | undefined>();

    // 等待交易确认
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const mutation = useMutation({
        mutationFn: async (info: UpdateProgressInfo) => {
            if (!address) {
                throw new Error("You need to connect your wallet first!");
            }

            const hash = await writeContractAsync({
                address: aiGoalContractConfig.address as `0x${string}`,
                abi: aiGoalContractConfig.abi,
                functionName: "updateProgress",
                args: [
                    info.goalId,
                    info.content,
                    info.percentage,
                    info.proofFileBlobId,
                ],
            });

            // 保存交易哈希和goalId用于等待确认后刷新
            setTxHash(hash);
            setGoalIdForRefresh(info.goalId);

            return { hash, goalId: info.goalId };
        },
        onError: (error) => {
            console.error("Failed to update progress:", error);
            setTxHash(undefined);
            setGoalIdForRefresh(undefined);
            throw error;
        },
    });

    // 当交易确认后，刷新数据
    useEffect(() => {
        if (isConfirmed && txHash && goalIdForRefresh) {
            console.log("✅ [useUpdateProgress] Transaction confirmed, invalidating queries...");
            
            // 使进度更新列表缓存失效
            queryClient.invalidateQueries({
                queryKey: [
                    QueryKey.GetGoalProgressUpdatesQueryKey,
                    goalIdForRefresh.toString(),
                ],
            });

            // 同时使目标数据缓存失效，以获取最新的进度百分比和计数器
            queryClient.invalidateQueries({
                queryKey: [
                    QueryKey.GetOneGoalQueryKey,
                    goalIdForRefresh.toString(),
                ],
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
    };
}
