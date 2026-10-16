import { createPublicClient, http } from 'viem';
import { vnkrMainnet } from './chains';

export const publicClient = createPublicClient({
  chain: vnkrMainnet,
  transport: http(),
});
