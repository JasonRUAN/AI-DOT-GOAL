import { useGetMultipleGoals } from "./useGetMultipleGoals";
import { useGetUserGoalIds } from "./useGetUserGoalIds";

export function useGetMyGoals() {
    const { userGoalIds, isPending: isLoadingIds, refetch } = useGetUserGoalIds();

    console.log("userGoalIds: ", userGoalIds);

    const { data: goals, isLoading: isLoadingGoals } = useGetMultipleGoals({
        goalIds: userGoalIds?.map((id) => id.toString()) || [],
    });

    // console.log("@@@>>>", goals);

    return {
        data: goals || [],
        isLoading: isLoadingIds || isLoadingGoals,
        error: null,
        refetch, // 暴露 refetch 方法
    };
}
