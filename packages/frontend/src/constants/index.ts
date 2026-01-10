export const QueryKey = {
    GetMyGoalsQueryKey: "GetMyGoalsQueryKey",
    GetOneGoalQueryKey: "GetOneGoalQueryKey",
    GetMultipleGoalsQueryKey: "GetMultipleGoalsQueryKey",
    GetGoalCommentsQueryKey: "GetGoalCommentsQueryKey",
    GetGoalProgressUpdatesQueryKey: "GetGoalProgressUpdatesQueryKey",
} as const;

export const CONSTANTS = {
    WALRUS: {
        PUBLISHER_URL: "https://publisher.walrus-testnet.walrus.space",
        AGGREGATOR_URL: "https://aggregator.walrus-testnet.walrus.space",
    },
    BLOCK_EXPLORER: {
        BASE_URL: "https://blockscout-passet-hub.parity-testnet.parity.io",
        TX_URL: "https://blockscout-passet-hub.parity-testnet.parity.io/tx",
    },
    // ELIZA_BASE_URL: "http://localhost:3001",
    ELIZA_BASE_URL:
        "https://912a9ee0476329a340c214c0363d978bf252ff8c-3001.dstack-prod5.phala.network",
    BACKEND_URL: "http://localhost:5050",
    // BACKEND_URL:
    //     "https://7eaccb584f75db4d525e57b8ef7f1bb23581455b-5050.dstack-prod5.phala.network",
};
