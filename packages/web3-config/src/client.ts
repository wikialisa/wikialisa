import { createPublicClient, http, type PublicClient } from 'viem';
import { vnkrMainnet } from './chains';

export const publicClient: PublicClient = createPublicClient({
  chain: vnkrMainnet,
  transport: http(),
}) as PublicClient;
