'use client';

import { Heart, MessageSquare } from 'lucide-react';
import { InteractionType } from './types';

interface InteractionsListProps {
  selectedType: InteractionType;
  onTypeChange: (type: InteractionType) => void;
}

export default function InteractionsList({ selectedType, onTypeChange }: InteractionsListProps) {
  const interactionTypes = [
    { type: 'likes', label: 'J\'aime', icon: <Heart size={20} /> },
    { type: 'comments', label: 'Commentaires', icon: <MessageSquare size={20} /> }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Interactions</h2>
      </div>
      <div className="p-2">
        {interactionTypes.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => onTypeChange(type as InteractionType)}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
              selectedType === type
                ? 'bg-primary text-white'
                : 'hover:bg-gray-50'
            }`}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}