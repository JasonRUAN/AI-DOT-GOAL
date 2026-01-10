"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { defineChain } from "viem";

// Define Paseo Passet Hub chain, not included in viem/chains
export const localNode = defineChain({
    id: 420420420,
    name: "Local Asset Hub",
    nativeCurrency: {
        decimals: 18,
        name: "Local DOT",
        symbol: "PAS",
    },
    rpcUrls: {
        default: { http: ["http://localhost:8545"] },
    },
    testnet: false,
    // Custom fee configuration for pallet-revive's fixed fee model
    // Polkadot revive requires: gas × gasPrice ≥ ~22-25 billion wei total
    fees: {
        estimateFeesPerGas: async () => {
            // With typical gas limit of 1M: 25,000,000,000 / 1,000,000 = 25,000 per gas
            return {
                maxFeePerGas: 25000000n, // 25M per gas unit = 25B total
                maxPriorityFeePerGas: 1000000n, // 1M tip
            };
        },
    },
});

// Define Paseo Passet Hub chain, not included in viem/chains
export const passetHub = defineChain({
    id: 420420422,
    name: "Passet Hub",
    nativeCurrency: {
        decimals: 18,
        name: "Paseo DOT",
        symbol: "PAS",
    },
    rpcUrls: {
        default: { http: ["https://testnet-passet-hub-eth-rpc.polkadot.io"] },
    },
    blockExplorers: {
        default: {
            name: "Blockscout",
            url: "https://blockscout-passet-hub.parity-testnet.parity.io",
            apiUrl: "https://blockscout-passet-hub.parity-testnet.parity.io/api",
        },
    },
    testnet: true,
});

const config = createConfig(
    getDefaultConfig({
        // Your dApps chains
        // chains: [localNode],
        // transports: {
        //     // RPC URL for each chain
        //     [localNode.id]: http(`http://localhost:8545`),
        // },
        chains: [passetHub],
        transports: {
            // RPC URL for each chain
            [passetHub.id]: http(`https://testnet-passet-hub-eth-rpc.polkadot.io`),
        },

        // Required API Keys
        walletConnectProjectId:
            process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

        // Required App Info
        appName: "AI-DOT-GOAL",
    }),
);

// const config = createConfig(
//     getDefaultConfig({
//         // Your dApps chains
//         chains: [monadTestnet],
//         transports: {
//             // RPC URL for each chain
//             [monadTestnet.id]: http(`https://testnet-rpc.monad.xyz/`),
//         },

//         // Required API Keys
//         walletConnectProjectId:
//             process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

//         // Required App Info
//         appName: "AI-DOT-GOAL",

//         // // Optional App Info
//         // appDescription: "Your App Description",
//         // appUrl: "https://family.co", // your app's url
//         // appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
//     }),
// );

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 0, // 数据立即视为过期
            refetchOnMount: true, // 挂载时重新获取
            refetchOnWindowFocus: true, // 窗口聚焦时重新获取
            retry: 3, // 失败重试3次
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数退避
        },
    },
});

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider>{children}</ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};

// https://docs.family.co/connectkit/getting-started#getting-started-section-3-implementation
