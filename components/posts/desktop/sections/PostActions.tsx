'use client';

import { Heart, MessageSquare, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';

interface PostActionsProps {
  postId: string;
  likes: Array<{ userId: string; likedAt: string }>;
  commentCount: number;
  onShowComments: () => void;
  onPostUpdate: (updatedPost: any) => void;
}

export default function PostActions({
  postId,
  likes,
  commentCount,
  onShowComments,
  onPostUpdate
}: PostActionsProps) {
  const router = useRouter();
  const [isLiking, setIsLiking] = useState(false);
  const userData = getUserData();
  const isLiked = likes.some(like => like.userId === userData?.id);

  const handleLike = async () => {
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/login');
      return;
    }

    setIsLiking(true);
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id })
      });

      if (!response.ok) throw new Error('Failed to update like status');

      const data = await response.json();
      onPostUpdate({
        ...post,
        likes: isLiked
          ? likes.filter(like => like.userId !== userData.id)
          : [...likes, { userId: userData.id, likedAt: new Date().toISOString() }]
      });
    } catch (error) {
      console.error('Error updating like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Partager ce post',
        url: window.location.href
      });
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
      {/* Stats Summary */}
      <div className="flex items-center gap-6 pb-4 mb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Heart size={16} className={isLiked ? 'text-red-500 fill-red-500' : 'text-gray-500'} />
          <span className="text-sm">
            {likes.length} {likes.length > 1 ? "j'aime" : "j'aime"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-gray-500" />
          <span className="text-sm">
            {commentCount} {commentCount > 1 ? 'commentaires' : 'commentaire'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isLiked ? 'text-red-500' : 'hover:bg-gray-100'
          }`}
        >
          <Heart
            size={20}
            className={isLiking ? 'animate-pulse' : ''}
            fill={isLiked ? 'currentColor' : 'none'}
          />
          <span>J'aime({likes.length})</span>
        </button>

        <button
          onClick={onShowComments}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MessageSquare size={20} />
          <span>Commenter({commentCount})</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Share2 size={20} />
          <span>Partager</span>
        </button>
      </div>
    </div>
  );
}