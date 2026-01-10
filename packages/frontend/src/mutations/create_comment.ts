import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useWriteContract } from "wagmi";
import { aiGoalContractConfig } from "@/constants/ContractConfig";
import { QueryKey } from "@/constants";

interface CommentInfo {
    goalId: number;
    content: string;
}

export function useCreateComment() {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (info: CommentInfo) => {
            if (!address) {
                throw new Error("You need to connect your wallet first pls!");
            }

            const result = await writeContractAsync({
                address: aiGoalContractConfig.address as `0x${string}`,
                abi: aiGoalContractConfig.abi,
                functionName: "createComment",
                args: [info.goalId, info.content],
            });

            return result;
        },
        onError: (error) => {
            console.error("Failed to create Comment:", error);
            throw error;
        },
        onSuccess: (data, variables) => {
            console.log("Successfully created Comment:", data);

            // 使用精确的goalId使评论列表缓存失效
            queryClient.invalidateQueries({
                queryKey: [
                    QueryKey.GetGoalCommentsQueryKey,
                    variables.goalId.toString(),
                ],
            });

            // 同时使目标数据缓存失效，以获取最新的评论计数器
            queryClient.invalidateQueries({
                queryKey: [
                    QueryKey.GetOneGoalQueryKey,
                    variables.goalId.toString(),
                ],
            });
        },
    });
}
