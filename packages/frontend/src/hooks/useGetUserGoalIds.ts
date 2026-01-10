import { useAccount, useReadContract } from "wagmi";
import toast from "react-hot-toast";
import { aiGoalContractConfig } from "@/constants/ContractConfig";
import { useEffect } from "react";

export function useGetUserGoalIds() {
    const { address } = useAccount();

    console.log("user address:", address);

    const {
        data: userGoalIds,
        isPending,
        error,
        status,
        fetchStatus,
        refetch,
        isError,
        isSuccess,
    } = useReadContract({
        address: aiGoalContractConfig.address as `0x${string}`,
        abi: aiGoalContractConfig.abi,
        functionName: "getUserGoals",
        args: [address],
        query: {
            enabled: !!address,
            staleTime: 0, // 始终视为过期，强制刷新
            refetchOnMount: true, // 组件挂载时刷新
            refetchOnWindowFocus: true, // 窗口聚焦时刷新
            retry: 3, // 重试3次
            retryDelay: 1000, // 重试延迟1秒
        },
    });

    // 监控查询状态变化
    useEffect(() => {
        console.log("=== useGetUserGoalIds Status Change ===");
        console.log("user address:", address);
        console.log("contract address:", aiGoalContractConfig.address);
        console.log("user goal ids:", userGoalIds);
        console.log("isPending:", isPending);
        console.log("isError:", isError);
        console.log("isSuccess:", isSuccess);
        console.log("status:", status);
        console.log("fetchStatus:", fetchStatus);
        console.log("error:", error);
        console.log("===============================");
    }, [address, userGoalIds, isPending, isError, isSuccess, status, fetchStatus, error]);

    if (!address) {
        return {
            userGoalIds: undefined,
            isPending: false,
            error: null,
        };
    }

    if (error) {
        toast.error(`获取用户目标失败: ${error.message}`);
        return {
            userGoalIds: undefined,
            isPending,
            error,
        };
    }

    if (isPending) {
        return {
            userGoalIds: undefined,
            isPending,
            error: null,
        };
    }

    return {
        userGoalIds: userGoalIds as bigint[] | undefined,
        isPending,
        error: null,
        refetch,
    };
}
