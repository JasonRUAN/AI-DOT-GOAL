import { usePublicClient } from "wagmi";
import { aiGoalContractConfig } from "@/constants/ContractConfig";
import { Address, decodeEventLog, Log } from "viem";
import { useCallback } from "react";

export type EventType =
    | "GoalCreated"
    | "GoalCompleted"
    | "WitnessConfirmed"
    | "GoalFailed"
    | "AgentCreated"
    | "AgentUpdated"
    | "CommentCreated"
    | "ProgressUpdated";

interface EventArgs {
    creator?: Address;
    completer?: Address;
    witness?: Address;
    failer?: Address;
    goalId?: bigint;
    title?: string;
    witnesses?: Address[];
    content?: string;
    progressPercentage?: bigint;
    proofFileBlobId?: string;
    agentId?: string;
    agentName?: string;
    characterJson?: string;
}

export function useQueryEvents(address?: Address) {
    const publicClient = usePublicClient();

    const queryEvents = useCallback(async () => {
        if (!publicClient)
            return {
                data: [],
                hasNextPage: false,
                nextCursor: null,
            };

        try {
            // 获取最新区块
            const blockNumber = await publicClient.getBlockNumber();

            // 获取过去100个区块的事件
            const fromBlock = blockNumber > 100n ? blockNumber - 100n : 0n;

            // 获取所有事件
            const logs = await publicClient.getLogs({
                address: aiGoalContractConfig.address as `0x${string}`,
                fromBlock,
                toBlock: blockNumber,
            });

            // 解码事件日志
            const decodedLogs = logs
                .map((log: Log) => {
                    try {
                        const decoded = decodeEventLog({
                            abi: aiGoalContractConfig.abi,
                            data: log.data,
                            topics: log.topics,
                        });
                        return {
                            ...decoded,
                            args: decoded.args as EventArgs,
                        };
                    } catch (e) {
                        console.error("Failed to decode event log:", e);
                        return null;
                    }
                })
                .filter(Boolean);

            // 如果提供了地址，过滤出该地址相关的事件
            const filteredLogs = address
                ? decodedLogs.filter((log) => {
                      if (!log?.args) return false;
                      // 检查事件中的地址字段
                      return (
                          log.args.creator === address ||
                          log.args.completer === address ||
                          log.args.witness === address ||
                          log.args.failer === address
                      );
                  })
                : decodedLogs;

            return {
                data: filteredLogs,
                hasNextPage: false,
                nextCursor: null,
            };
        } catch (error) {
            console.error("Error querying events:", error);
            return {
                data: [],
                hasNextPage: false,
                nextCursor: null,
            };
        }
    }, [publicClient, address]);

    return { queryEvents };
}
