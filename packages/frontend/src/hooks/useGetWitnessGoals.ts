import { useGetMultipleGoals } from "./useGetMultipleGoals";
import { useGetWitnessGoalIds } from "./useGetWitnessGoalIds";

export function useGetWitnessGoals() {
    const { witnessGoalIds } = useGetWitnessGoalIds();

    const { data: goals } = useGetMultipleGoals({
        goalIds: witnessGoalIds?.map((id) => id.toString()) || [],
    });

    // console.log("@@@>>>", goals);

    return {
        data: goals || [],
        isLoading: false,
        error: null,
    };
}
