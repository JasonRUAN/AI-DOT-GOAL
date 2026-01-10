import { useMutation } from "@tanstack/react-query";
import { useAccount, useWriteContract } from "wagmi";
import { aiGoalContractConfig } from "@/constants/ContractConfig";

interface UpdateProgressInfo {
    goalId: number;
    content: string;
    percentage: number;
    proofFileBlobId: string;
}

export function useUpdateProgress() {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();

    return useMutation({
        mutationFn: async (info: UpdateProgressInfo) => {
            if (!address) {
                throw new Error("You need to connect your wallet first!");
            }

            const result = await writeContractAsync({
                address: aiGoalContractConfig.address as `0x${string}`,
                abi: aiGoalContractConfig.abi,
                functionName: "updateProgress",
                args: [
                    info.goalId,
                    info.content,
                    info.percentage,
                    info.proofFileBlobId,
                ],
            });

            return result;
        },
        onError: (error) => {
            console.error("Failed to update progress:", error);
            throw error;
        },
        onSuccess: (data) => {
            console.log("Successfully updated progress:", data);
        },
    });
}
