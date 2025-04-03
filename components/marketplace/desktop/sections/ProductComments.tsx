'use client';

import { useState, useEffect } from 'react';
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
  };
}

interface ProductCommentsProps {
  productId: string;
}

export default function ProductComments({ productId }: ProductCommentsProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [productId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/comments`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des commentaires');
      
      const data = await response.json();
      
      // Check if user has liked each comment
      const userData = getUserData();
      if (userData?.id) {
        data.comments.forEach((comment: Comment) => {
          comment.isLiked = comment.likes > 0; // This should be improved to check actual user likes
        });
      }
      
      setComments(data.comments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Impossible de charger les commentaires');
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
      const response = await fetch(`/api/products/${productId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          content: newComment
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'envoi du commentaire');

      const comment = await response.json();
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Impossible d\'envoyer le commentaire');
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
      const response = await fetch(`/api/products/comments/${commentId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour du like');

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

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">
        Commentaires ({comments.length})
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircle2 size={24} />
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none min-h-[100px]"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:bg-gray-300"
              >
                {isSubmitting ? (
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
      </form>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex gap-4 pb-6 border-b border-gray-100 last:border-0"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCircle2 size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-medium">{comment.author.name}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {format(new Date(comment.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 mb-2">{comment.content}</p>
              <button
                onClick={() => handleLike(comment.id, comment.isLiked)}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                <Heart
                  size={16}
                  fill={comment.isLiked ? 'currentColor' : 'none'}
                />
                <span>{comment.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}