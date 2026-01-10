import { useReadContract } from "wagmi";
import { toast } from "sonner";
import { aiGoalContractConfig } from "@/constants/ContractConfig";

export function useGetOneGoal({ goalId }: { goalId: number }) {
    const { data, isPending, error, refetch } = useReadContract({
        address: aiGoalContractConfig.address as `0x${string}`,
        abi: aiGoalContractConfig.abi,
        functionName: "getGoal",
        args: [goalId],
        query: {
            enabled: !!goalId,
        },
    });

    console.log("🎯 [GetOneGoal] Hook state:", {
        goalId,
        hasData: !!data,
        isPending,
        hasError: !!error,
        data: data ? {
            // @ts-ignore
            progressPercentage: data[5],
            // @ts-ignore
            progressUpdateCounter: data[11],
        } : null,
    });

    if (!goalId) {
        return {
            data: undefined,
            isPending: false,
            error: null,
        };
    }

    if (error) {
        console.error("❌ [GetOneGoal] Error:", error);
        toast.error(`获取目标详情失败: ${error.message}`);
        return {
            data: undefined,
            isPending,
            error,
        };
    }

    if (isPending) {
        console.log("⏳ [GetOneGoal] Loading...");
        return {
            data: undefined,
            isPending,
            error: null,
        };
    }

    console.log("✅ [GetOneGoal] Data loaded successfully");
    return {
        data,
        isPending,
        error: null,
        refetch,
    };
}
