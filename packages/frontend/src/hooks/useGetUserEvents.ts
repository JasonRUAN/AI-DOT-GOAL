import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { aiGoalContractConfig } from "@/constants/ContractConfig";
import { Address, decodeEventLog, Log } from "viem";

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
    commentId?: bigint;
    updateId?: bigint;
    title?: string;
    witnesses?: Address[];
    content?: string;
    progressPercentage?: bigint;
    proofFileBlobId?: string;
    agentId?: string;
    agentName?: string;
    characterJson?: string;
}

export interface DecodedEvent {
    eventName: EventType;
    args: EventArgs;
    blockNumber: bigint;
    transactionHash: string;
    logIndex: number;
}

export function useGetUserEvents(address?: Address) {
    const publicClient = usePublicClient();

    return useQuery({
        queryKey: ["userEvents", address],
        queryFn: async () => {
            if (!publicClient || !address) {
                return [];
            }

            try {
                // 获取最新区块
                const blockNumber = await publicClient.getBlockNumber();

                // 获取过去1000个区块的事件 (约3-4小时的数据)
                const fromBlock =
                    blockNumber > 1000n ? blockNumber - 1000n : 0n;

                // 获取所有合约事件
                const logs = await publicClient.getLogs({
                    address: aiGoalContractConfig.address as `0x${string}`,
                    fromBlock,
                    toBlock: blockNumber,
                });

                // 解码事件日志
                const decodedLogs: DecodedEvent[] = logs
                    .map((log: Log) => {
                        try {
                            const decoded = decodeEventLog({
                                abi: aiGoalContractConfig.abi,
                                data: log.data,
                                topics: log.topics,
                            });
                            
                            // 验证事件名称是否为有效的 EventType
                            const validEventNames: string[] = [
                                "GoalCreated",
                                "GoalCompleted",
                                "WitnessConfirmed",
                                "GoalFailed",
                                "AgentCreated",
                                "AgentUpdated",
                                "CommentCreated",
                                "ProgressUpdated",
                            ];
                            
                            const eventName = String(decoded.eventName ?? "");
                            if (!validEventNames.includes(eventName)) {
                                return null;
                            }
                            
                            return {
                                eventName: eventName as EventType,
                                args: decoded.args as EventArgs,
                                blockNumber: log.blockNumber || 0n,
                                transactionHash: log.transactionHash || "",
                                logIndex: log.logIndex || 0,
                            };
                        } catch (e) {
                            console.error("Failed to decode event log:", e);
                            return null;
                        }
                    })
                    .filter((log): log is DecodedEvent => log !== null);

                // 过滤出与当前用户相关的事件
                const userEvents = decodedLogs.filter((log) => {
                    const args = log.args;
                    // 检查事件中的地址字段是否匹配当前用户
                    return (
                        args.creator?.toLowerCase() === address.toLowerCase() ||
                        args.completer?.toLowerCase() ===
                            address.toLowerCase() ||
                        args.witness?.toLowerCase() === address.toLowerCase() ||
                        args.failer?.toLowerCase() === address.toLowerCase()
                    );
                });

                // 按区块号和日志索引降序排序 (最新的在前)
                userEvents.sort((a, b) => {
                    if (a.blockNumber === b.blockNumber) {
                        return b.logIndex - a.logIndex;
                    }
                    return Number(b.blockNumber - a.blockNumber);
                });

                return userEvents;
            } catch (error) {
                console.error("Error querying user events:", error);
                return [];
            }
        },
        enabled: !!publicClient && !!address,
        refetchInterval: 30000, // 每30秒自动刷新
        staleTime: 20000, // 20秒内认为数据是新鲜的
    });
}
