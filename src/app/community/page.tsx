"use client";

import { 
  Users,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Shield,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Post {
  id: string;
  userId: string;
  content: string;
  likes: number;
  createdAt: string;
}

export default function CommunityPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in?redirect=/community");
    }
  }, [session, isPending, router]);

  // Load posts from database
  useEffect(() => {
    if (session?.user) {
      loadPosts();
    }
  }, [session]);

  const loadPosts = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/community", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Failed to load community posts");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!session?.user) return;

    const wasLiked = likedPosts.has(postId);
    
    // Optimistic update
    if (wasLiked) {
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      setPosts(prev =>
        prev.map(post =>
          post.id === postId ? { ...post, likes: post.likes - 1 } : post
        )
      );
    } else {
      setLikedPosts(prev => new Set(prev).add(postId));
      setPosts(prev =>
        prev.map(post =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );
    }

    // Update in database
    try {
      const token = localStorage.getItem("bearer_token");
      await fetch(`/api/community?id=${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          likes: wasLiked ? -1 : 1,
        }),
      });
    } catch (error) {
      console.error("Error updating like:", error);
      // Revert on error
      if (wasLiked) {
        setLikedPosts(prev => new Set(prev).add(postId));
      } else {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
      toast.error("Failed to update like");
    }
  };

  const handlePost = async () => {
    if (!newPostContent.trim() || !session?.user) return;

    setPosting(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/community", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: session.user.id,
          content: newPostContent,
          likes: 0,
        }),
      });

      if (!response.ok) throw new Error("Failed to create post");

      const data = await response.json();
      setPosts(prev => [data.post, ...prev]);
      setNewPostContent("");
      toast.success("Post shared with community!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  if (isPending || loading) {
    return (
      <div className="relative min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-orchid-neon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-black">
      <main className="relative z-10 container mx-auto px-6 py-12 max-w-4xl pb-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Wellness Community
          </h1>
          <p className="text-lg text-zinc-400">
            Share your journey, inspire others, grow together
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm text-center">
            <Users size={28} className="mx-auto mb-2 text-orchid-neon" />
            <p className="text-2xl font-bold text-white">1.2K</p>
            <p className="text-xs text-zinc-400">Members</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm text-center">
            <MessageCircle size={28} className="mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold text-white">{posts.length}</p>
            <p className="text-xs text-zinc-400">Posts</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm text-center">
            <Heart size={28} className="mx-auto mb-2 text-red-400" />
            <p className="text-2xl font-bold text-white">89%</p>
            <p className="text-xs text-zinc-400">Positive</p>
          </div>
        </div>

        {/* Create Post */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Share with Community</h3>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Share your wellness journey, tips, or ask questions..."
            className="w-full h-24 px-4 py-3 bg-black/50 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-orchid-neon focus:border-orchid-neon outline-none text-white resize-none mb-4"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-zinc-400">
              <Shield size={14} className="text-orchid-neon" />
              <span>Posts are anonymous • AI-moderated • Be kind</span>
            </div>
            <button
              onClick={handlePost}
              disabled={!newPostContent.trim() || posting}
              className="px-6 py-3 bg-orchid-neon hover:bg-orchid-neon/90 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
            >
              {posting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Post
                </>
              )}
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="p-12 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm text-center">
              <MessageCircle size={48} className="mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-400">No posts yet. Be the first to share!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orchid to-orchid-neon flex items-center justify-center text-white text-lg">
                      👤
                    </div>
                    <div>
                      <p className="font-semibold text-white">Anonymous User</p>
                      <p className="text-xs text-zinc-400">{formatTimestamp(post.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <p className="mb-4 leading-relaxed text-zinc-300">{post.content}</p>

                {/* Post Actions */}
                <div className="flex items-center space-x-6 pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 transition-colors ${
                      likedPosts.has(post.id) ? "text-orchid-neon" : "text-zinc-400 hover:text-orchid-neon"
                    }`}
                  >
                    <Heart size={18} fill={likedPosts.has(post.id) ? "currentColor" : "none"} />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-zinc-400 hover:text-orchid-neon transition-colors">
                    <Share2 size={18} />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Community Guidelines */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Community Guidelines</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>• Be supportive and respectful to all members</li>
            <li>• Share your authentic wellness journey</li>
            <li>• Celebrate others' achievements</li>
            <li>• No medical advice - only personal experiences</li>
            <li>• No negativity, judgment, or harmful content</li>
            <li>• No spam or promotional content</li>
          </ul>
          <p className="text-xs text-zinc-500 mt-4">
            AI moderation ensures a positive, supportive space for everyone
          </p>
        </div>
      </main>
    </div>
  );
}