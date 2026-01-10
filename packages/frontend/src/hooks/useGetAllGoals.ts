import { useReadContract } from "wagmi";
import { aiGoalContractConfig } from "@/constants/ContractConfig";
import { useGetMultipleGoals } from "./useGetMultipleGoals";

export function useGetAllGoals() {
    // 获取活跃目标ID列表
    const { data: activeGoalIds } = useReadContract({
        address: aiGoalContractConfig.address as `0x${string}`,
        abi: aiGoalContractConfig.abi,
        functionName: "getActiveGoals",
    });

    // 获取已完成目标ID列表
    const { data: completedGoalIds } = useReadContract({
        address: aiGoalContractConfig.address as `0x${string}`,
        abi: aiGoalContractConfig.abi,
        functionName: "getCompletedGoals",
    });

    // 获取失败目标ID列表
    const { data: failedGoalIds } = useReadContract({
        address: aiGoalContractConfig.address as `0x${string}`,
        abi: aiGoalContractConfig.abi,
        functionName: "getFailedGoals",
    });

    // 合并所有目标ID
    const allGoalIds = [
        ...((activeGoalIds as bigint[]) || []),
        ...((completedGoalIds as bigint[]) || []),
        ...((failedGoalIds as bigint[]) || []),
    ];

    // 将bigint转换为string数组
    const goalIdsAsStrings = allGoalIds.map((id) => id.toString());

    // 使用现有的useGetMultipleGoals hook获取目标详情
    const { data: goals } = useGetMultipleGoals({
        goalIds: goalIdsAsStrings,
    });

    return {
        data: goals || [],
        isLoading: false,
        error: null,
    };
}
