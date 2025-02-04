import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from './constants';
import type { ContractPost } from './types';

export const walletClient = createWalletClient({
  chain: baseSepolia,
  transport: custom(window.ethereum!)
});

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const contractConfig = {
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: CONTRACT_ABI,
};

export const getAllPosts = async (): Promise<ContractPost[]> => {
  const data = await client.readContract({
    ...contractConfig,
    functionName: 'getAllPosts',
  }) as ContractPost[];
  return data;
};

export const getTotalPosts = async (): Promise<bigint> => {
  const data = await client.readContract({
    ...contractConfig,
    functionName: 'getTotalPosts',
  }) as bigint;
  return data;
};

export const createPost = async (message: string): Promise<`0x${string}`> => {
  if (!window.ethereum) throw new Error("No ethereum provider found");
  const [account] = await walletClient.getAddresses();
  const { request } = await client.simulateContract({
    ...contractConfig,
    functionName: 'createPost',
    args: [message],
    account,
  });
  const hash = await walletClient.writeContract(request);
  const receipt = await client.waitForTransactionReceipt({
    hash
  })
  return receipt.transactionHash
};
