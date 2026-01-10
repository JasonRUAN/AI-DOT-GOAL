import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useWriteContract } from "wagmi";
import { aiGoalContractConfig } from "@/constants/ContractConfig";
import { QueryKey } from "@/constants";

interface AgentInfo {
    goalId: number;
    agentId: string;
    agentName: string;
    characterJson: string;
}

export function useCreateAgent() {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (info: AgentInfo) => {
            if (!address) {
                throw new Error("You need to connect your wallet first pls!");
            }

            const result = await writeContractAsync({
                address: aiGoalContractConfig.address as `0x${string}`,
                abi: aiGoalContractConfig.abi,
                functionName: "createAgent",
                args: [
                    info.goalId,
                    info.agentId,
                    info.agentName,
                    info.characterJson,
                ],
            });

            return result;
        },
        onError: (error) => {
            console.error("Failed to create Agent:", error);
            throw error;
        },
        onSuccess: (data, variables) => {
            console.log("Successfully created Agent:", data);

            // 使目标数据缓存失效，以获取最新的Agent信息
            queryClient.invalidateQueries({
                queryKey: [
                    QueryKey.GetOneGoalQueryKey,
                    variables.goalId.toString(),
                ],
            });

            // 如果有Agent相关的查询，也可以在这里失效缓存
            // queryClient.invalidateQueries({
            //     queryKey: [QueryKey.GetAgentQueryKey, variables.agentId],
            // });
        },
    });
}
