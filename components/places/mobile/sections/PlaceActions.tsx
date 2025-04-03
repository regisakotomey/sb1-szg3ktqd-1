'use client';

import { DollarSign, Edit, Trash2, Flag } from 'lucide-react';

interface PlaceActionsProps {
  placeId: string;
  isOwner: boolean;
  onSponsor: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
}

export default function PlaceActions({
  placeId,
  isOwner,
  onSponsor,
  onEdit,
  onDelete,
  onReport
}: PlaceActionsProps) {
  return (
    <div className="bg-white rounded-lg p-3">
      <div className="flex flex-wrap gap-2">
        {isOwner ? (
          <>
            <button
              onClick={onSponsor}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-600 text-white rounded-lg text-sm"
            >
              <DollarSign size={16} />
              <span>Sponsoriser</span>
            </button>
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-lg text-sm"
            >
              <Edit size={16} />
              <span>Modifier</span>
            </button>
            <button
              onClick={onDelete}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500 text-white rounded-lg text-sm"
            >
              <Trash2 size={16} />
              <span>Supprimer</span>
            </button>
          </>
        ) : (
          <button
            onClick={onReport}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm w-full"
          >
            <Flag size={16} />
            <span>Signaler</span>
          </button>
        )}
      </div>
    </div>
  );
}