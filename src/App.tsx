import React, { useState, useEffect } from 'react';
import { walletClient, getAllPosts, getTotalPosts, createPost } from './utils/viem';
import { pinata, uploadData } from './utils/pinata';
import type { ContractPost, Post } from './utils/types';

export function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [account, setAccount] = useState<string>('');
  const [totalPosts, setTotalPosts] = useState<number>(0);

  useEffect(() => {
    loadPosts();
    if (typeof window.ethereum === 'undefined') {
      setError('Please install a Web3 wallet like Coinbase Wallet to interact with this app');
    }
  }, []);

  async function connectWallet(): Promise<void> {
    if (typeof window.ethereum === 'undefined') return;

    try {
      const [address] = await walletClient.requestAddresses();
      setAccount(address);

      await walletClient.switchChain({ id: 84532 }).catch((err) => console.log(err));

    } catch (err) {
      const error = err as Error;
      setError('Failed to connect wallet: ' + error.message);
    }
  }

  async function loadPosts(): Promise<void> {
    try {
      const allPosts = await getAllPosts();
      const total = await getTotalPosts();

      // Fetch content from IPFS for each post
      const postsWithContent = await Promise.all(
        allPosts.map(async (post: ContractPost): Promise<Post> => {
          try {
            const url = await pinata.gateways.public.convert(post.message)
            const response = await fetch(url);
            const content = await response.json();
            return {
              poster: post.poster,
              message: content.message,
              imageUrl: content.imageUrl || null,
              timestamp: new Date(Number(post.timestamp) * 1000).toLocaleString()
            };
          } catch (err) {
            console.log(err)
            // If fetching fails, return the message as is
            return {
              poster: "",
              message: "",
              imageUrl: null,
              timestamp: ""
            };
          }
        })
      );

      setPosts(postsWithContent);
      setTotalPosts(Number(total));
    } catch (err) {
      const error = err as Error;
      setError('Failed to load posts: ' + error.message);
    }
  }

  async function submitPost(): Promise<void> {
    if (!newMessage.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Upload content to IPFS first
      const uri = await uploadData(newMessage, selectedImage || undefined);
      if (!uri) {
        throw new Error('Failed to upload content to IPFS');
      }

      // Create post with IPFS URI
      await createPost(`ipfs://${uri}`);
      setNewMessage('');
      setSelectedImage(null);
      loadPosts();
    } catch (err) {
      const error = err as Error;
      setError('Failed to create post: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleMessageChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    setNewMessage(e.target.value);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>): void {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="bg-[#3b5998] text-white px-4 py-2">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">thedappbook</h1>
          <button
            onClick={connectWallet}
            className="text-sm bg-white text-[#3b5998] px-3 py-1 rounded-sm hover:bg-[#f5f6f7]"
          >
            {account ?
              `${account.slice(0, 6)}...${account.slice(-4)}` :
              'Connect Wallet'
            }
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-4 px-4">
        {error && (
          <div className="bg-[#ffebe8] border border-[#dd3c10] text-[#333333] p-2 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white border border-[#b3b3b3] p-3 mb-4">
          <div className="border-b border-[#d8dfea] pb-2 mb-2">
            <h2 className="text-[#3b5998] font-bold">Wall Posts ({totalPosts})</h2>
          </div>

          <div className="mb-4">
            <textarea
              className="w-full p-2 border border-[#bdc7d8] text-[#333333] mb-2"
              rows={3}
              value={newMessage}
              onChange={handleMessageChange}
              placeholder="What's on your mind?"
            />
            <div className="flex items-center gap-4">
              <label className={`bg-[#f5f6f7] text-[#3b5998] px-4 py-1 rounded-xs border border-[#bdc7d8] ${(loading || !account) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#e4e6e9] cursor-pointer'}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading || !account}
                  className="hidden"
                />
                {selectedImage ? selectedImage.name : 'Add Image'}
              </label>
              <button
                className="bg-[#3b5998] text-white px-4 py-1 rounded-xs border border-[#29487d] hover:bg-[#2f477a] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={submitPost}
                disabled={loading || !account}
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {posts.slice().reverse().map((post: Post, index: number) => (
            <div key={index} className="bg-white border border-[#b3b3b3] p-3">
              <div className="flex justify-between items-start border-b border-[#d8dfea] pb-2 mb-2">
                <span className="text-[#3b5998] font-bold">
                  {post.poster.slice(0, 6)}...{post.poster.slice(-4)}
                </span>
                <span className="text-[#777777] text-sm">
                  {post.timestamp}
                </span>
              </div>
              <p className="text-[#333333] mb-2">{post.message}</p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post attachment"
                  className="max-w-full h-auto rounded"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-[#b3b3b3] py-4">
        <div className="max-w-2xl mx-auto px-4 text-center text-[#777777] text-sm">
          Decentralized Ethereum Wall
        </div>
      </div>
    </div>
  );
}
