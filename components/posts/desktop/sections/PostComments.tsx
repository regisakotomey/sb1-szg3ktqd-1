'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, UserCircle2, Heart } from 'lucide-react';
import { getUserData } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface PostCommentsProps {
  postId: string;
  onPostUpdate: (updatedPost: any) => void;
  post: any;
  onClose: () => void;
}

export default function PostComments({
  postId,
  onPostUpdate,
  post,
  onClose
}: PostCommentsProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments(1);
  }, [postId]);

  const fetchComments = async (pageNum: number) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments?page=${pageNum}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      
      const data = await response.json();
      // Check if user has liked each comment
      const userData = getUserData();
      if (userData?.id) {
        data.comments.forEach((comment: Comment) => {
          comment.isLiked = comment.likes > 0; // This should be improved to check actual user likes
        });
      }
      if (pageNum === 1) {
        setComments(data.comments);
      } else {
        setComments(prev => [...prev, ...data.comments]);
      }
      
      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreComments = () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      fetchComments(page + 1);
    }
  };

  const scrollToTop = () => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/login');
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          content: newComment
        }),
      });

      if (!response.ok) throw new Error('Failed to submit comment');

      const comment = await response.json();
      
      // Update comments state and post data
      setComments(prev => [comment, ...prev]);
      onPostUpdate({
        ...post,
        comments: [comment, ...post.comments]
      });
      setNewComment('');

      // Scroll to top after state updates
      setTimeout(scrollToTop, 100);
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string, isLiked: boolean) => {
    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`/api/posts/comments/${commentId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id }),
      });

      if (!response.ok) throw new Error('Failed to update like status');

      const data = await response.json();
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId
          ? { ...comment, likes: data.likes, isLiked: data.isLiked }
          : comment
      ));
    } catch (err) {
      console.error('Error updating like:', err);
    }
  };

  const handleAuthorClick = (authorId: string) => {
    router.push(`/userprofile/${authorId}`);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold">Commentaires</h2>
          </div>
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Commentaires</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ×
          </button>
        </div>

        <div 
          ref={commentsContainerRef}
          className="flex-1 overflow-y-auto p-4"
        >
          {error ? (
            <div className="text-center text-red-600 p-4">
              {error}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 p-4">
              Aucun commentaire pour le moment
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3"
                >
                  <div 
                    onClick={() => handleAuthorClick(comment.author.id)}
                    className="cursor-pointer"
                  >
                    {comment.author.avatar ? (
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserCircle2 size={20} />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div 
                        className="font-medium text-sm mb-1 hover:underline cursor-pointer"
                        onClick={() => handleAuthorClick(comment.author.id)}
                      >
                        {comment.author.name}
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </span>
                      <button
                        onClick={() => handleLike(comment.id, comment.isLiked)}
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                      >
                        <Heart
                          size={14}
                          className={comment.isLiked ? 'fill-red-500 text-red-500' : ''}
                        />
                        <span className="text-xs">{comment.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={loadMoreComments}
                    disabled={isLoadingMore}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {isLoadingMore ? (
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Voir plus de commentaires'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCircle2 size={20} />
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="w-full p-2 text-sm border border-gray-200 rounded-lg resize-none min-h-[80px]"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm disabled:bg-gray-300"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Publier</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}