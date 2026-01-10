import { useMutation } from "@tanstack/react-query";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { aiGoalContractConfig } from "@/constants/ContractConfig";
import { useState } from "react";

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
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

    // 监听交易确认状态
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash: txHash,
        });

    return {
        mutation: useMutation({
            mutationFn: async (info: GoalInfo) => {
                if (!address) {
                    throw new Error("你需要先连接钱包！");
                }

                const value = parseEther(info.amount.toString());

                // 提交交易
                const hash = await writeContractAsync({
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

                // 保存交易哈希用于监听
                setTxHash(hash);

                return hash;
            },
            onError: (error) => {
                console.error("创建目标失败:", error);
                setTxHash(undefined);
                throw error;
            },
            onSuccess: (data) => {
                console.log("交易已提交:", data);
            },
        }),
        isConfirming,
        isConfirmed,
        txHash,
    };
}
