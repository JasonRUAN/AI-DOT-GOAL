import { useAccount, useReadContract } from "wagmi";
import toast from "react-hot-toast";
import { aiGoalContractConfig } from "@/constants/ContractConfig";

export function useGetWitnessGoalIds() {
    const { address } = useAccount();

    const {
        data: witnessGoalIds,
        isPending,
        error,
    } = useReadContract({
        address: aiGoalContractConfig.address as `0x${string}`,
        abi: aiGoalContractConfig.abi,
        functionName: "getWitnessGoals",
        args: [address],
        query: {
            enabled: !!address,
        },
    });

    if (!address) {
        return {
            witnessGoalIds: undefined,
            isPending: false,
            error: null,
        };
    }

    if (error) {
        toast.error(`获取见证者目标失败: ${error.message}`);
        return {
            witnessGoalIds: undefined,
            isPending,
            error,
        };
    }

    if (isPending) {
        return {
            witnessGoalIds: undefined,
            isPending,
            error: null,
        };
    }

    return {
        witnessGoalIds: witnessGoalIds as bigint[] | undefined,
        isPending,
        error: null,
    };
}
