'use client';

import { DollarSign, Edit, Trash2, Flag, Share2, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Product } from '@/types/product';

interface ProductActionsProps {
  productId: string;
  isOwner: boolean;
  onSponsor: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onShare: () => void;
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

export default function ProductActions({
  productId,
  isOwner,
  onSponsor,
  onEdit,
  onDelete,
  onReport,
  onShare
}: ProductActionsProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState('');

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
      const response = await fetch(`/api/products/${productId}/report`, {
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
      console.error('Error reporting product:', error);
      setReportError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ShoppingBag size={18} />
            <span>Commander</span>
          </button>

          <div className="flex gap-2">
            {isOwner ? (
              <>
                <button
                  onClick={onSponsor}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <DollarSign size={18} />
                  <span>Sponsoriser</span>
                </button>
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
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Supprimer le produit"
        message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
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
              <h3 className="text-xl font-bold">Signaler le produit</h3>
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