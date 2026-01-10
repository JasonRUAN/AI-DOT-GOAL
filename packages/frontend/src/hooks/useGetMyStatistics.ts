import { useAccount, useReadContract } from "wagmi";
import { aiGoalContractConfig } from "@/constants/ContractConfig";
import toast from "react-hot-toast";

export function useGetMyStatistics() {
    const { address } = useAccount();

    // 获取用户的目标ID列表
    const {
        data: userGoalIds,
        isPending: userGoalsPending,
        error: userGoalsError,
    } = useReadContract({
        address: aiGoalContractConfig.address as `0x${string}`,
        abi: aiGoalContractConfig.abi,
        functionName: "getUserGoals",
        args: [address],
        query: {
            enabled: !!address,
        },
    });

    // 获取活跃目标ID列表
    const {
        data: activeGoalIds,
        isPending: activeGoalsPending,
        error: activeGoalsError,
    } = useReadContract({
        address: aiGoalContractConfig.address as `0x${string}`,
        abi: aiGoalContractConfig.abi,
        functionName: "getActiveGoals",
    });

    // 获取已完成目标ID列表
    const {
        data: completedGoalIds,
        isPending: completedGoalsPending,
        error: completedGoalsError,
    } = useReadContract({
        address: aiGoalContractConfig.address as `0x${string}`,
        abi: aiGoalContractConfig.abi,
        functionName: "getCompletedGoals",
    });

    // 获取失败目标ID列表
    const {
        data: failedGoalIds,
        isPending: failedGoalsPending,
        error: failedGoalsError,
    } = useReadContract({
        address: aiGoalContractConfig.address as `0x${string}`,
        abi: aiGoalContractConfig.abi,
        functionName: "getFailedGoals",
    });

    // 统计目标数量
    const statistics = {
        active: 0,
        completed: 0,
        failed: 0,
        total: 0,
    };

    // 检查是否有错误
    if (userGoalsError) {
        toast.error(`获取用户目标失败: ${userGoalsError.message}`);
    }
    if (activeGoalsError) {
        toast.error(`获取活跃目标失败: ${activeGoalsError.message}`);
    }
    if (completedGoalsError) {
        toast.error(`获取已完成目标失败: ${completedGoalsError.message}`);
    }
    if (failedGoalsError) {
        toast.error(`获取失败目标失败: ${failedGoalsError.message}`);
    }

    console.log(`userGoalIds: ${userGoalIds}`);
    console.log(`activeGoalIds: ${activeGoalIds}`);
    console.log(`completedGoalIds: ${completedGoalIds}`);
    console.log(`failedGoalIds: ${failedGoalIds}`);

    // 如果用户已连接钱包且数据已加载，进行统计
    if (
        address &&
        userGoalIds &&
        activeGoalIds &&
        completedGoalIds &&
        failedGoalIds
    ) {
        const userGoalIdsArray = userGoalIds as bigint[];
        const activeGoalIdsArray = activeGoalIds as bigint[];
        const completedGoalIdsArray = completedGoalIds as bigint[];
        const failedGoalIdsArray = failedGoalIds as bigint[];

        // 统计用户目标在各个状态中的数量
        userGoalIdsArray.forEach((goalId: bigint) => {
            if (activeGoalIdsArray.some((id) => id === goalId)) {
                statistics.active++;
            } else if (completedGoalIdsArray.some((id) => id === goalId)) {
                statistics.completed++;
            } else if (failedGoalIdsArray.some((id) => id === goalId)) {
                statistics.failed++;
            }
        });

        statistics.total =
            statistics.active + statistics.completed + statistics.failed;
    }

    const isLoading =
        userGoalsPending ||
        activeGoalsPending ||
        completedGoalsPending ||
        failedGoalsPending;
    const hasError =
        userGoalsError ||
        activeGoalsError ||
        completedGoalsError ||
        failedGoalsError;

    return {
        data: statistics,
        isLoading,
        error: hasError
            ? userGoalsError ||
              activeGoalsError ||
              completedGoalsError ||
              failedGoalsError
            : null,
    };
}
