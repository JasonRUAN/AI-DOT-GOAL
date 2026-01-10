import { useReadContract } from "wagmi";
import { aiGoalContractConfig } from "@/constants/ContractConfig";
import { toast } from "sonner";

export function useGetAgent({ agentId }: { agentId: string }) {
    const {
        data: agentData,
        isPending,
        error,
        refetch,
    } = useReadContract({
        address: aiGoalContractConfig.address as `0x${string}`,
        abi: aiGoalContractConfig.abi,
        functionName: "getAgent",
        args: [agentId],
        query: {
            enabled: !!agentId,
        },
    });

    if (!agentId) {
        return {
            agentData: undefined,
            isPending: false,
            error: null,
            refetch,
        };
    }

    if (error) {
        toast.error(`获取代理信息失败: ${error.message}`);
        return {
            agentData: undefined,
            isPending,
            error,
            refetch,
        };
    }

    if (isPending) {
        return {
            agentData: undefined,
            isPending,
            error: null,
            refetch,
        };
    }

    // 解构返回的数据：[agentId, agentName, characterJson, exists]
    const [returnedAgentId, agentName, characterJson, exists] = agentData as [
        string,
        string,
        string,
        boolean,
    ];

    return {
        agentData: {
            agentId: returnedAgentId,
            agentName,
            characterJson,
            exists,
        },
        isPending,
        error: null,
        refetch,
    };
}
