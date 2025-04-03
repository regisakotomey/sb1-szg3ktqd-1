'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Bell, Share2, Heart, User, MoreVertical, Send, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Author {
  id: string;
  name: string;
  avatar: string | null;
  followers: number;
  isFollowed: boolean;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
  };
}

interface Post {
  _id: string;
  userId: string;
  content: string;
  media: string[];
  createdAt: string;
  likes: Array<{ userId: string; likedAt: string }>;
  comments: Comment[];
  author: Author | null;
  isDeleted?: boolean;
}

interface Pagination {
  total: number;
  page: number;
  pages: number;
}

export default function PostFeed() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{url: string; index: number} | null>(null);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [visibleCommentCounts, setVisibleCommentCounts] = useState<{ [key: string]: number }>({});
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pages: 1 });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchPosts();

    // Listen for post creation events
    const handlePostCreated = () => {
      fetchPosts();
    };

    window.addEventListener('postCreated', handlePostCreated);
    return () => {
      window.removeEventListener('postCreated', handlePostCreated);
    };
  }, []);

  const fetchPosts = async (page = 1) => {
    try {
      const userData = getUserData();
      const response = await fetch(`/api/posts/get?currentUserId=${userData?.id || ''}&page=${page}&limit=10`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des posts');
      
      const data = await response.json();
      if (page === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMorePosts = () => {
    if (pagination.page < pagination.pages && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchPosts(pagination.page + 1);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id })
      });

      if (!response.ok) throw new Error('Failed to update like status');

      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            likes: isLiked
              ? post.likes.filter(like => like.userId !== userData.id)
              : [...post.likes, { userId: userData.id, likedAt: new Date().toISOString() }]
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleFollow = async (authorId: string, isFollowed: boolean) => {
    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`/api/users/${authorId}/follow`, {
        method: isFollowed ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id })
      });

      if (!response.ok) throw new Error('Failed to update follow status');

      const data = await response.json();
      setPosts(prev => prev.map(post => {
        if (post.author?.id === authorId) {
          return {
            ...post,
            author: {
              ...post.author,
              followers: data.followers,
              isFollowed: data.isFollowed
            }
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error updating follow:', error);
    }
  };

  const handleMessage = (authorId: string) => {
    router.push(`/messages?userId=${authorId}`);
  };

  const handleComment = async (postId: string) => {
    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/login');
      return;
    }

    if (commentingPostId === postId) {
      setCommentingPostId(null);
      setNewComment('');
      setVisibleCommentCounts(prev => ({ ...prev, [postId]: 0 }));
    } else {
      setCommentingPostId(postId);
      setVisibleCommentCounts(prev => ({ ...prev, [postId]: 2 }));
      setTimeout(() => {
        if (commentTextareaRef.current) {
          commentTextareaRef.current.focus();
        }
      }, 100);
    }
  };

  const submitComment = async (postId: string) => {
    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/login');
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          content: newComment
        })
      });

      if (!response.ok) throw new Error('Failed to submit comment');

      const comment = await response.json();
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            comments: [comment, ...post.comments]
          };
        }
        return post;
      }));
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const loadMoreComments = (postId: string) => {
    setVisibleCommentCounts(prev => ({
      ...prev,
      [postId]: (prev[postId] || 2) + 2
    }));
  };

  const getVisibleComments = (post: Post) => {
    if (!commentingPostId || commentingPostId !== post._id) {
      return [];
    }
    
    const sortedComments = [...post.comments].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return sortedComments.slice(0, visibleCommentCounts[post._id] || 2);
  };

  const handleDeletePost = async (postId: string) => {
    const userData = getUserData();
    if (!userData?.id) return;

    try {
      const response = await fetch('/api/posts/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId: userData.id
        })
      });

      if (!response.ok) throw new Error('Failed to delete post');

      setPosts(prev => prev.filter(post => post._id !== postId));
      setOpenMenuPostId(null);
      setShowDeleteConfirm(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/5" />
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
            <div className="flex justify-between">
              <div className="h-8 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const userData = getUserData();
        const isLiked = post.likes.some(like => like.userId === userData?.id);
        const isOwner = userData?.id === post.userId;

        return (
          <div key={post._id} className="bg-white rounded-xl shadow-sm">
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {post.author?.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{post.author?.name || 'Utilisateur'}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(post.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!isOwner && post.author && userData?.id !== post.author.id && (
                    <div className="flex gap-2">
                      {post.author.isFollowed && (
                        <button
                          onClick={() => handleMessage(post.author.id)}
                          className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <MessageSquare size={16} />
                          <span>Message</span>
                        </button>
                      )}
                      {!post.author.isFollowed && (
                        <button
                          onClick={() => handleFollow(post.author.id, post.author.isFollowed)}
                          className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <Bell size={16} />
                          <span>S'abonner</span>
                        </button>
                      )}
                    </div>
                  )}
                  
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuPostId(openMenuPostId === post._id ? null : post._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>
                    
                    {openMenuPostId === post._id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        {isOwner ? (
                          <button
                            onClick={() => {
                              setPostToDelete(post._id);
                              setShowDeleteConfirm(true);
                              setOpenMenuPostId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50 transition-colors"
                          >
                            Supprimer
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReportPost(post._id)}
                            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Signaler
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-800 whitespace-pre-wrap mb-4">{post.content}</p>

              {post.media.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {post.media.map((url, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedMedia({ url, index })}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                    >
                      <img
                        src={url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleLike(post._id, isLiked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked ? 'text-red-500' : 'hover:bg-gray-100'
                  }`}
                >
                  <Heart
                    size={20}
                    fill={isLiked ? 'currentColor' : 'none'}
                  />
                  <span>J'aime({post.likes.length})</span>
                </button>

                <button
                  onClick={() => handleComment(post._id)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MessageSquare size={20} />
                  <span>Commenter({post.comments.length})</span>
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: post.content,
                        text: post.content,
                        url: window.location.href
                      });
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Share2 size={20} />
                  <span>Partager</span>
                </button>
              </div>
            </div>

            {commentingPostId === post._id && (
              <div className="px-4 py-3 border-t border-gray-100">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      ref={commentTextareaRef}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Écrivez un commentaire..."
                      className="w-full p-3 border border-gray-200 rounded-lg resize-none min-h-[100px]"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => submitComment(post._id)}
                        disabled={!newComment.trim() || isSubmittingComment}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:bg-gray-300"
                      >
                        {isSubmittingComment ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send size={20} />
                            <span>Publier</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {post.comments.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {getVisibleComments(post).map((comment, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <div className="bg-gray-100 rounded-lg p-3">
                            <div className="font-medium mb-1">{comment.author.name}</div>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {format(new Date(comment.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                          </div>
                        </div>
                      </div>
                    ))}

                    {post.comments.length > (visibleCommentCounts[post._id] || 2) && (
                      <button
                        onClick={() => loadMoreComments(post._id)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mt-2"
                      >
                        <ChevronDown size={20} />
                        <span>Voir plus de commentaires</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {pagination.page < pagination.pages && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMorePosts}
            disabled={isLoadingMore}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              'Charger plus'
            )}
          </button>
        </div>
      )}

      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setSelectedMedia(null)}
        >
          <img
            src={selectedMedia.url}
            alt={`Media ${selectedMedia.index + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Supprimer le post"
        message="Êtes-vous sûr de vouloir supprimer ce post ? Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={() => {
          if (postToDelete) {
            handleDeletePost(postToDelete);
          }
        }}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setPostToDelete(null);
        }}
      />
    </div>
  );
}