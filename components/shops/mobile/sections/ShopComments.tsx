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

interface ShopCommentsProps {
  shopId: string;
}

export default function ShopComments({ shopId }: ShopCommentsProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [shopId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/shops/${shopId}/comments`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des commentaires');
      
      const data = await response.json();
      const userData = getUserData();
      if (userData?.id) {
        data.comments.forEach((comment: Comment) => {
          comment.isLiked = comment.likes > 0;
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
      const response = await fetch(`/api/shops/${shopId}/comments`, {
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
      const response = await fetch(`/api/shops/comments/${commentId}/like`, {
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
    <div className="space-y-4">
      {/* Formulaire de commentaire */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-3">
        <div className="flex gap-1 items-center">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="flex-1 p-2 text-sm border border-gray-200 rounded-lg resize-none min-h-[40px]"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full disabled:bg-gray-300"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </form>

      {/* Liste des commentaires */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-white rounded-lg p-3"
          >
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <UserCircle2 size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{comment.author.name}</span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(comment.createdAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
                  </span>
                </div>
                <p className="text-sm mt-1 break-words">
                  {comment.content}
                </p>
                <button
                  onClick={() => handleLike(comment.id, comment.isLiked)}
                  className="flex items-center gap-1 mt-2 text-gray-500"
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
      </div>
    </div>
  );
}