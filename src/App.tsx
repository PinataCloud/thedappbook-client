import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x7c85E8ce45F346C9E5aF3be9FD4dEBf9E97141E1"; // Replace with your deployed contract address
const CONTRACT_ABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "message", "type": "string" }], "name": "NewPost", "type": "event" }, { "inputs": [{ "internalType": "string", "name": "_message", "type": "string" }], "name": "createPost", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getAllPosts", "outputs": [{ "components": [{ "internalType": "address", "name": "poster", "type": "address" }, { "internalType": "string", "name": "message", "type": "string" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "internalType": "struct FBWall.Post[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getTotalPosts", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }];

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

interface Post {
  poster: string;
  message: string;
  timestamp: string;
}

interface ContractPost {
  poster: string;
  message: string;
  timestamp: bigint;
}

const WallApp = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [account, setAccount] = useState<string>('');
  const [totalPosts, setTotalPosts] = useState<number>(0);

  useEffect(() => {
    connectWallet();
    loadPosts();
  }, []);

  const connectWallet = async (): Promise<void> => {
    try {
      if (window.ethereum) {
        const accounts: string[] = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setAccount(accounts[0]);
      } else {
        setError('Please install MetaMask to use this application');
      }
    } catch (err) {
      const error = err as Error;
      setError('Failed to connect wallet: ' + error.message);
    }
  };

  const loadPosts = async (): Promise<void> => {
    try {
      if (!window.ethereum) throw new Error("No ethereum provider found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const allPosts: ContractPost[] = await contract.getAllPosts();
      const total: bigint = await contract.getTotalPosts();

      setPosts(allPosts.map((post: ContractPost): Post => ({
        poster: post.poster,
        message: post.message,
        timestamp: new Date(Number(post.timestamp) * 1000).toLocaleString()
      })));

      setTotalPosts(Number(total));
    } catch (err) {
      const error = err as Error;
      setError('Failed to load posts: ' + error.message);
    }
  };

  const createPost = async (): Promise<void> => {
    if (!newMessage.trim()) return;

    setLoading(true);
    setError('');

    try {
      if (!window.ethereum) throw new Error("No ethereum provider found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.createPost(newMessage);
      await tx.wait(); // This should work with ethers v6

      setNewMessage('');
      loadPosts();
    } catch (err) {
      const error = err as Error;
      setError('Failed to create post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setNewMessage(e.target.value);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Facebook Blue Header */}
      <div className="bg-[#3b5998] text-white px-4 py-2">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">thedappbook</h1>
          <div className="text-sm">
            {account ?
              `${account.slice(0, 6)}...${account.slice(-4)}` :
              'Not Connected'
            }
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-4 px-4">
        {error && (
          <div className="bg-[#ffebe8] border border-[#dd3c10] text-[#333333] p-2 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Profile Info Box */}
        <div className="bg-white border border-[#b3b3b3] p-3 mb-4">
          <div className="border-b border-[#d8dfea] pb-2 mb-2">
            <h2 className="text-[#3b5998] font-bold">Wall Posts ({totalPosts})</h2>
          </div>

          {/* Post Creation Box */}
          <div className="mb-4">
            <textarea
              className="w-full p-2 border border-[#bdc7d8] text-[#333333] mb-2"
              rows={3}
              value={newMessage}
              onChange={handleMessageChange}
              placeholder="What's on your mind?"
            />
            <button
              className="bg-[#3b5998] text-white px-4 py-1 rounded-xs border border-[#29487d] hover:bg-[#2f477a] disabled:opacity-50"
              onClick={createPost}
              disabled={loading || !account}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Wall Posts */}
        <div className="space-y-3">
          {posts.map((post: Post, index: number) => (
            <div key={index} className="bg-white border border-[#b3b3b3] p-3">
              <div className="flex justify-between items-start border-b border-[#d8dfea] pb-2 mb-2">
                <span className="text-[#3b5998] font-bold">
                  {post.poster.slice(0, 6)}...{post.poster.slice(-4)}
                </span>
                <span className="text-[#777777] text-sm">
                  {post.timestamp}
                </span>
              </div>
              <p className="text-[#333333]">{post.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 border-t border-[#b3b3b3] py-4">
        <div className="max-w-2xl mx-auto px-4 text-center text-[#777777] text-sm">
          Decentralized Ethereum Wall
        </div>
      </div>
    </div>
  );
};

export default WallApp;
