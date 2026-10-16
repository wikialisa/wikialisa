import type { Address } from 'viem';

export interface ChainContracts {
  wrappedNative: Address;
  dexFactory: Address;
  dexRouter: Address;
  paymentGateway: Address;
  governanceTimelock: Address;
}

export const CONTRACT_ADDRESSES: Record<number, ChainContracts> = {
  // AXQ Mainnet (8888)
  8888: {
    wrappedNative: '0x0000000000000000000000000000000000000001',
    dexFactory: '0x0000000000000000000000000000000000000002',
    dexRouter: '0x0000000000000000000000000000000000000003',
    paymentGateway: '0x0000000000000000000000000000000000000004',
    governanceTimelock: '0x0000000000000000000000000000000000000005',
  },
  // AXQ Testnet (8889)
  8889: {
    wrappedNative: '0x1000000000000000000000000000000000000001',
    dexFactory: '0x1000000000000000000000000000000000000002',
    dexRouter: '0x1000000000000000000000000000000000000003',
    paymentGateway: '0x1000000000000000000000000000000000000004',
    governanceTimelock: '0x1000000000000000000000000000000000000005',
  },
};

export const getContractsByChainId = (chainId: number): ChainContracts => {
  const contracts = CONTRACT_ADDRESSES[chainId];
  if (!contracts) {
    throw new Error(`Chưa cấu hình hợp đồng cho Chain ID: ${chainId}`);
  }
  return contracts;
};
