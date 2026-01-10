import { QueryKey } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { GoalDetail } from "@/types/move";
import { aiGoalContractConfig } from "@/constants/ContractConfig";

export function useGetMultipleGoals({ goalIds }: { goalIds: string[] }) {
    const publicClient = usePublicClient();

    return useQuery({
        queryKey: [QueryKey.GetMultipleGoalsQueryKey, goalIds],
        queryFn: async () => {
            if (!publicClient) throw new Error("Public client not found");

            const promises = goalIds.map(async (goalId) => {
                try {
                    const result = (await publicClient.readContract({
                        address: aiGoalContractConfig.address as `0x${string}`,
                        abi: aiGoalContractConfig.abi,
                        functionName: "getGoal",
                        args: [Number(goalId)],
                    })) as GoalDetail;

                    return result;
                } catch (error) {
                    console.error(`Failed to fetch goal ${goalId}:`, error);
                    return null;
                }
            });

            return Promise.all(promises);
        },
        enabled: goalIds.length > 0 && !!publicClient,
        // select: (data: (GetGoalReturnType | null)[]) => {
        //     return data.map((goalData) => {
        //         if (!goalData) return null;

        //         const {
        //             id,
        //             title,
        //             description,
        //             deadline,
        //             amount,
        //             creator,
        //             witnesses,
        //             status,
        //         } = goalData;

        //         return {
        //             id,
        //             title,
        //             description,
        //             deadline,
        //             amount,
        //             creator,
        //             witnesses,
        //             status,
        //         } as GoalFields;
        //     });
        // },
    });
}
