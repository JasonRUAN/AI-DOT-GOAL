import { useReadContract } from "wagmi";
import { toast } from "sonner";
import { aiGoalContractConfig } from "@/constants/ContractConfig";

export function useGetGoalAgentId({ goalId }: { goalId: number }) {
    const {
        data: agentId,
        isPending,
        error,
        refetch,
    } = useReadContract({
        address: aiGoalContractConfig.address as `0x${string}`,
        abi: aiGoalContractConfig.abi,
        functionName: "goalToAgent",
        args: [goalId],
        query: {
            enabled: !!goalId,
        },
    });

    if (!goalId) {
        return {
            agentId: undefined,
            isPending: false,
            error: null,
        };
    }

    if (error) {
        toast.error(`获取目标代理ID失败: ${error.message}`);
        return {
            agentId: undefined,
            isPending,
            error,
        };
    }

    if (isPending) {
        return {
            agentId: undefined,
            isPending,
            error: null,
        };
    }

    return {
        agentId,
        isPending,
        error: null,
        refetch,
    };
}
