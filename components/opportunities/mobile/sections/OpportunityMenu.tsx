'use client';

import { Share2, Edit, Trash2, Flag } from 'lucide-react';
import { useState } from 'react';
import EditOpportunityForm from '@/components/forms/mobile/EditOpportunityForm';
import { Opportunity } from '@/types/opportunity';
import { getUserData } from '@/lib/storage';
import { useRouter } from 'next/navigation';

interface OpportunityMenuProps {
  isOpen: boolean;
  isOwner: boolean;
  opportunity: Opportunity;
  onClose: () => void;
  onShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onEditComplete: () => void;
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

export default function OpportunityMenu({
  isOpen,
  isOwner,
  opportunity,
  onClose,
  onShare,
  onEdit,
  onDelete,
  onReport,
  onEditComplete
}: OpportunityMenuProps) {
  const router = useRouter();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState('');

  const handleEdit = () => {
    setShowEditForm(true);
    onClose();
  };

  const handleEditComplete = () => {
    setShowEditForm(false);
    onEditComplete();
  };

  const handleDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
    onClose();
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
      const response = await fetch(`/api/opportunities/${opportunity._id}/report`, {
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
      onClose();
      onReport();
    } catch (error) {
      console.error('Error reporting opportunity:', error);
      setReportError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (showEditForm) {
    return <EditOpportunityForm opportunity={opportunity} onClose={handleEditComplete} />;
  }

  if (showDeleteConfirm) {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowDeleteConfirm(false)}
        />
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-50 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Supprimer l'opportunité</h3>
            <p className="text-gray-600 text-sm mb-6">
              Êtes-vous sûr de vouloir supprimer cette opportunité ? Cette action est irréversible.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Supprimer
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
    );
  }

  if (showReportForm) {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowReportForm(false)}
        />
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-50 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Signaler l'opportunité</h3>
            
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
    );
  }

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-50 overflow-hidden">
        <div className="p-2">
          <button
            onClick={() => {
              onShare();
              onClose();
            }}
            className="flex items-center gap-3 w-full p-4 hover:bg-gray-50 text-left"
          >
            <Share2 size={20} />
            <span>Partager</span>
          </button>

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
                  onClose();
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
                onClose();
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
  );
}