'use client';

import { Share2, Edit, Trash2, Flag } from 'lucide-react';

interface AdSpotMenuProps {
  isOpen: boolean;
  isOwner: boolean;
  onClose: () => void;
  onShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
}

export default function AdSpotMenu({
  isOpen,
  isOwner,
  onClose,
  onShare,
  onEdit,
  onDelete,
  onReport
}: AdSpotMenuProps) {
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
                onClick={() => {
                  onEdit();
                  onClose();
                }}
                className="flex items-center gap-3 w-full p-4 hover:bg-gray-50 text-left"
              >
                <Edit size={20} />
                <span>Modifier</span>
              </button>

              <div className="h-px bg-gray-100 my-2" />

              <button
                onClick={() => {
                  onDelete();
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
                onReport();
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