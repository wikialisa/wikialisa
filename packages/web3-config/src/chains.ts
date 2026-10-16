import { defineChain } from 'viem';

export const vnkrMainnet = defineChain({
  id: 8888,
  name: 'AXQ Network Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'AXQ',
    symbol: 'AXQ',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.axvn.vn'],
      webSocket: [process.env.NEXT_PUBLIC_WSS_RPC_URL || 'wss://rpc-ws.axvn.vn'],
    },
    public: {
      http: ['https://rpc.axvn.vn'],
    },
  },
  blockExplorers: {
    default: {
      name: 'AXVNScan',
      url: 'https://scan.axvn.vn',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1,
    },
  },
});

export const vnkrTestnet = defineChain({
  id: 8889,
  name: 'AXQ Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Test AXQ',
    symbol: 'tAXQ',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.axvn.vn'],
    },
  },
  blockExplorers: {
    default: {
      name: 'AXVNScan Testnet',
      url: 'https://testnet-scan.axvn.vn',
    },
  },
  testnet: true,
});

export const supportedChains = [vnkrMainnet, vnkrTestnet] as const;
