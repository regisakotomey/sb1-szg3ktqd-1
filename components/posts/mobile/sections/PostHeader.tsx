'use client';

import { User, MoreVertical, MessageSquare, Bell } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Author {
  id: string;
  name: string;
  avatar: string | null;
  followers: number;
  isFollowed: boolean;
  followsYou?: boolean;
}

interface PostHeaderProps {
  author: Author | null;
  createdAt: string;
  postId: string;
  onPostUpdate: (updatedPost: any) => void;
}

export default function PostHeader({
  author,
  createdAt,
  postId,
  onPostUpdate
}: PostHeaderProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const userData = getUserData();
  const isOwner = userData?.id === author?.id;

  const handleFollow = async () => {
    if (!author || !userData?.id || !userData.isVerified) {
      router.push('/auth/mobile/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${author.id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id })
      });

      if (!response.ok) throw new Error('Failed to update follow status');

      const data = await response.json();

      onPostUpdate({
        postId,
        author: {
          ...author,
          followers: data.followers,
          isFollowed: data.isFollowed
        }
      });
      
    } catch (error) {
      console.error('Error updating follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

  const handleMessage = (authorId: string) => {
    router.push(`/messages?userId=${authorId}`);
  };

  const handleReportPost = async (postId: string) => {
    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/login');
      return;
    }

    // Ici vous pouvez implémenter la logique de signalement
    // Pour l'instant on ferme juste le menu
    setOpenMenuPostId(null);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch('/api/posts/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId: userData?.id
        })
      });

      if (!response.ok) throw new Error('Failed to delete post');

      // Refresh the posts list
      window.dispatchEvent(new CustomEvent('postDeleted', { detail: postId }));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="flex justify-between items-start mb-3">
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          {author?.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-small text-xs">{author?.name || 'Utilisateur'}</h3>
            {author?.followsYou && userData?.id != author?.id && (
              <span className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded-full">
                Vous suit
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {format(new Date(createdAt), 'dd/MMMM à HH:mm', { locale: fr })}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {!isOwner && author && userData?.id !== author.id && (
          <div className="flex gap-2">
            {author.isFollowed && (
              <button
                onClick={() => handleMessage(author.id)}
                className="flex items-center gap-2 px-1 py-1.5 border border-gray-200 hover:bg-gray-50 transition-colors text-[10px]"
              >
                <span>Message</span>
              </button>
            )}
            {!author.isFollowed && (
              <button
              onClick={handleFollow}
              disabled={isLoading}
              className="flex items-center gap-2 px-1 py-1.5 border border-gray-200 hover:bg-gray-50 transition-colors text-[10px]"
              >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                  S'abonner
                  </span>
                </>
              )}
            </button>            
            )}
          </div>
        )}
        
        
      </div>
    </div>
  );
}