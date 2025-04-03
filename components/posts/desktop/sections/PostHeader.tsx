'use client';

import { User, MessageSquare, Bell, MoreVertical, Edit, Trash2, Flag } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import EditPostForm from '@/components/forms/EditPostForm';
import { Post } from '@/types/post';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Author {
  id: string;
  name: string;
  avatar: string | null;
  followers: number;
  isFollowed: boolean;
  followsYou?: boolean;
}

interface PostHeaderProps {
  post: Post;
  author: Author | null;
  createdAt: string;
  postId: string;
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

export default function PostHeader({
  post,
  author,
  createdAt,
  postId,
  onPostUpdate
}: PostHeaderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const userData = getUserData();
  const isOwner = userData?.id === author?.id;

  const handleFollow = async () => {
    if (!author || !userData?.id || !userData.isVerified) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${author.id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update follow status');
      }

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

  const handleMessage = () => {
    router.push(`/messages?userId=${author.id}`);
  };

  const handleAuthorClick = () => {
    router.push(`/userprofile/${author.id}`);
  };

  const handleEdit = () => {
    setShowEditForm(true);
    setOpenMenuPostId(null);
  };

  const handleEditComplete = () => {
    setShowEditForm(false);
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

      // Dispatch event to remove post from feed
      window.dispatchEvent(new CustomEvent('postDeleted', { detail: postId }));
      setShowDeleteConfirm(false);
      setOpenMenuPostId(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      setReportError('Veuillez sélectionner un motif de signalement');
      return;
    }

    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/login');
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

      setShowReportDialog(false);
      setOpenMenuPostId(null);
    } catch (error) {
      console.error('Error reporting post:', error);
      setReportError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div 
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer"
            onClick={handleAuthorClick}
          >
            {author?.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 
                className="font-medium cursor-pointer"
                onClick={handleAuthorClick}
              >
                {author?.name || 'Utilisateur'}
              </h3>
              {author?.followsYou && userData?.id != author?.id && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  Vous suit
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {format(new Date(createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isOwner && author && userData?.id !== author.id && (
            <div className="flex gap-2">
              {author.isFollowed ? (
                <button
                  onClick={handleMessage}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <MessageSquare size={14} />
                  <span>Message</span>
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Bell size={14} />
                      <span>S'abonner</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          <div className="relative">
            <button 
              onClick={() => setOpenMenuPostId(openMenuPostId === postId ? null : postId)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical size={20} />
            </button>
            
            {openMenuPostId === postId && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {isOwner ? (
                  <>
                    <button
                      onClick={handleEdit}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Edit size={16} />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      <span>Supprimer</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowReportDialog(true)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Flag size={16} />
                    <span>Signaler</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditForm && (
        <EditPostForm
          post={post}
          onClose={handleEditComplete}
          onPostUpdate={onPostUpdate}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Supprimer la publication"
        message="Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {showReportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">Signaler la publication</h3>
            </div>

            <div className="p-6">
              {reportError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-4">
              <button
                onClick={() => setShowReportDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReport}
                disabled={isSubmittingReport}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300"
              >
                {isSubmittingReport ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Signaler'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}