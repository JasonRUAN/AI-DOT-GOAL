import { useMutation } from "@tanstack/react-query";
import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { aiGoalContractConfig } from "@/constants/ContractConfig";

interface GoalInfo {
    title: string;
    description: string;
    ai_suggestion: string;
    deadline: number;
    witnesses: string[];
    amount: number;
}

export interface Goal extends GoalInfo {
    id: string;
    status: "pending" | "completed" | "failed";
    progress?: number;
}

export function useCreateGoal() {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();

    return useMutation({
        mutationFn: async (info: GoalInfo) => {
            if (!address) {
                throw new Error("你需要先连接钱包！");
            }

            const value = parseEther(info.amount.toString());

            const result = await writeContractAsync({
                address: aiGoalContractConfig.address as `0x${string}`,
                abi: aiGoalContractConfig.abi,
                functionName: "createGoal",
                args: [
                    info.title,
                    info.description,
                    info.ai_suggestion,
                    info.deadline,
                    info.witnesses,
                ],
                value,
            });

            return result;
        },
        onError: (error) => {
            console.error("创建目标失败:", error);
            throw error;
        },
        onSuccess: (data) => {
            console.log("成功创建目标:", data);
        },
    });
}
