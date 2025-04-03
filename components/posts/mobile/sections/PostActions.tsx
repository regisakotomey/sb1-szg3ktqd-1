'use client';

import { Heart, MessageSquare, Share2, Edit, Trash2, Flag, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import { Post } from '@/types/post';
import EditPostForm from '@/components/forms/mobile/EditPostForm';

interface Author {
  id: string;
  name: string;
  avatar: string | null;
  followers: number;
  isFollowed: boolean;
}

interface PostActionsProps {
  post: Post;
  author: Author | null;
  createdAt: string;
  postId: string;
  likes: Array<{ userId: string; likedAt: string }>;
  commentCount: number;
  onShowComments: () => void;
  onPostUpdate: (updatedPost: any) => void;
}

const REPORT_REASONS = [
  { value: 'inappropriate', label: 'Contenu inapproprié' },
  { value: 'spam', label: 'Spam' },
  { value: 'offensive', label: 'Contenu offensant' },
  { value: 'fake', label: 'Fausse information' },
  { value: 'scam', label: 'Arnaque' },
  { value: 'violence', label: 'Violence' },
  { value: 'copyright', label: 'Violation des droits d\'auteur' },
  { value: 'other', label: 'Autre' }
];

export default function PostActions({
  post,
  author,
  createdAt,
  postId,
  likes,
  commentCount,
  onShowComments,
  onPostUpdate
}: PostActionsProps) {
  const router = useRouter();
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const userData = getUserData();
  const isOwner = userData?.id === author?.id;
  const isLiked = likes.some(like => like.userId === userData?.id);

  const handleLike = async () => {
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/mobile/login');
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
        postId,
        ...post,
        likes: data.likes
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
    setShowMenu(false);
  };

  const handleEdit = () => {
    setShowEditForm(true);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    try {
      setIsDeletingPost(true);
      const response = await fetch('/api/posts/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId: userData?.id
        })
      });

      if (!response.ok) throw new Error('Failed to delete post');

      // Dispatch event to remove post from feed
      window.dispatchEvent(new CustomEvent('postDeleted', { detail: postId }));
      setShowDeleteConfirm(false);
      setShowMenu(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      setReportError('Veuillez sélectionner un motif de signalement');
      return;
    }

    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/mobile/login');
      return;
    }

    setIsSubmittingReport(true);
    setReportError('');

    try {
      const response = await fetch(`/api/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          reason: reportReason,
          description: reportDescription
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors du signalement');
      }

      setShowReportForm(false);
      setShowMenu(false);
    } catch (error) {
      console.error('Error reporting post:', error);
      setReportError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (showEditForm) {
    return (
      <EditPostForm
        post={post}
        onClose={() => setShowEditForm(false)}
        onPostUpdate={onPostUpdate}
      />
    );
  }

  return (
    <>
      <div className="bg-white shadow-sm">
        {/* Stats Summary */}
        <div className="flex items-center justify-end gap-3 pb-2 border-gray-100">
          <div className="flex items-center gap-2">
            <Heart size={12} className="text-gray-450" />
            <span className="text-xs text-gray-450">
              {likes.length} {likes.length > 1 ? "j'aime" : "j'aime"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare size={12} className="text-gray-450" />
            <span className="text-xs text-gray-450">
              {commentCount} {commentCount > 1 ? 'commentaires' : 'commentaire'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs ${
              isLiked ? 'text-red-500' : 'hover:bg-gray-100'
            }`}
          >
            <Heart
              size={14}
              className={isLiking ? 'animate-pulse' : ''}
              fill={isLiked ? 'currentColor' : 'none'}
            />
          </button>

          <button
            onClick={onShowComments}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors text-xs"
          >
            <MessageSquare size={14} />
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors text-xs"
          >
            <Share2 size={14} />
          </button>

          <button
            onClick={() => setShowMenu(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors text-xs"
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {/* Menu Modal */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-50 overflow-hidden">
            <div className="p-2">
              {isOwner ? (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-3 w-full p-4 hover:bg-gray-50 text-left"
                  >
                    <Edit size={20} />
                    <span>Modifier</span>
                  </button>

                  <div className="h-px bg-gray-100 my-2" />

                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-3 w-full p-4 hover:bg-gray-50 text-red-600 text-left"
                  >
                    <Trash2 size={20} />
                    <span>Supprimer</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowReportForm(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-3 w-full p-4 hover:bg-gray-50 text-left"
                >
                  <Flag size={20} />
                  <span>Signaler</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-50 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">Supprimer la publication</h3>
              <p className="text-gray-600 text-sm mb-6">
                Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isDeletingPost}
                  className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  {isDeletingPost ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    'Supprimer'
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Report Form Modal */}
      {showReportForm && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowReportForm(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-50 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Signaler la publication</h3>
              
              {reportError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {reportError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif du signalement *
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Sélectionner un motif</option>
                    {REPORT_REASONS.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (facultatif)
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Décrivez le problème..."
                    className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleReport}
                    disabled={isSubmittingReport}
                    className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300 text-sm"
                  >
                    {isSubmittingReport ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      'Signaler'
                    )}
                  </button>
                  <button
                    onClick={() => setShowReportForm(false)}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}