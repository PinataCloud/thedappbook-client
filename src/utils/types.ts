import 'viem/window';

export interface Contract {
  getAllPosts: () => Promise<ContractPost[]>;
  getTotalPosts: () => Promise<bigint>;
  createPost: (message: string) => Promise<`0x${string}`>;
}

export interface ContractPost {
  poster: string;
  message: string;
  timestamp: bigint;
}

export interface Post {
  poster: string;
  message: string;
  imageUrl: string | null;
  timestamp: string;
}
