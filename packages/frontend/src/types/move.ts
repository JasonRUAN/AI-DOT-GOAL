import { Address } from "viem";

export interface GoalFields {
    id: number;
    title: string;
    description: string;
    deadline: bigint;
    amount: bigint;
    creator: Address;
    witnesses: Address[];
    status: number;
}

export type GoalDetail = {
    id: number;
    title: string;
    aiSuggestion: string;
    description: string;
    creator: Address;
    amount: bigint;
    status: number;
    createdAt: bigint;
    deadline: bigint;
    commentCounter: number;
    progressPercentage: number;
    progressUpdateCounter: number;
    witnesses: Address[];
    confirmations: Address[];
};

export type CommentDetail = {
    id: number;
    content: string;
    creator: Address;
    createdAt: bigint;
};

export type ProgressUpdateDetail = {
    id: number;
    content: string;
    proofFileBlobId: string;
    creator: Address;
    createdAt: bigint;
};
