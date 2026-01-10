import { Address } from "viem";

export type GetGoalReturnType = {
    id: bigint;
    title: string;
    description: string;
    deadline: bigint;
    amount: bigint;
    creator: Address;
    witnesses: Address[];
    status: number;
};
