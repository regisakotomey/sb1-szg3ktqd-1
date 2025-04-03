'use client';

import { Share2, Edit, Trash2, Flag, Heart } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface EventActionsProps {
  eventId: string;
  isOwner: boolean;
  isInterested: boolean;
  organizerType: 'user' | 'place';
  organizerId: string;
  onSponsor: () => void;
  onShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onToggleInterest: (newState: boolean) => void;
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

export default function EventActions({
  eventId,
  isOwner,
  isInterested,
  organizerType,
  organizerId,
  onSponsor,
  onShare,
  onEdit,
  onDelete,
  onReport,
  onToggleInterest
}: EventActionsProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user is the place owner if event is organized by a place
  const checkPlaceOwnership = async (): Promise<boolean> => {
    if (organizerType !== 'place') return false;
    
    try {
      const userData = getUserData();
      if (!userData?.id) return false;

      const response = await fetch(`/api/places/${organizerId}?currentUserId=${userData.id}`);
      if (!response.ok) return false;

      const placeData = await response.json();
      return placeData.organizer?.type === 'user' && placeData.organizer?.id === userData.id;
    } catch (error) {
      console.error('Error checking place ownership:', error);
      return false;
    }
  };

  const handleInterest = async () => {
    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/interest`, {
        method: isInterested ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id })
      });

      if (!response.ok) throw new Error('Failed to update interest status');

      onToggleInterest(!isInterested);
    } catch (error) {
      console.error('Error updating interest status:', error);
    } finally {
      setIsLoading(false);
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
      const response = await fetch(`/api/events/${eventId}/report`, {
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
      onReport();
    } catch (error) {
      console.error('Error reporting event:', error);
      setReportError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Check if user is either direct owner or place owner
  const checkOwnership = async () => {
    if (isOwner) return true;
    if (organizerType === 'place') {
      return await checkPlaceOwnership();
    }
    return false;
  };

  useEffect(() => {
    const updateOwnership = async () => {
      const isOwner = await checkOwnership();
      setIsEventOwner(isOwner);
    };
    updateOwnership();
  }, []);

  const [isEventOwner, setIsEventOwner] = useState(isOwner);

  return (
    <>
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="">
          {isEventOwner ? (
            <div className="flex justify-between items-center gap-2">
              {/* Share button on the left */}
              <button
                onClick={onShare}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 size={18} />
                <span>Partager</span>
              </button>
              
              {/* Edit and Delete buttons grouped on the right */}
              <div className="flex gap-2">
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  <Edit size={18} />
                  <span>Modifier</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              {/* Interest button on the left */}
              <button
                onClick={handleInterest}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isInterested
                    ? 'bg-primary text-white hover:bg-primary-hover'
                    : 'border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Heart size={18} fill={isInterested ? 'currentColor' : 'none'} />
                    <span>{isInterested ? 'Vous êtes intéressé' : "S'intéresser"}</span>
                  </>
                )}
              </button>

              {/* Share and Report buttons grouped on the right */}
              <div className="flex gap-2">
                <button
                  onClick={onShare}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 size={18} />
                  <span>Partager</span>
                </button>
                <button
                  onClick={() => setShowReportDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Flag size={18} />
                  <span>Signaler</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Supprimer l'événement"
        message="Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDelete();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {showReportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">Signaler l'événement</h3>
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