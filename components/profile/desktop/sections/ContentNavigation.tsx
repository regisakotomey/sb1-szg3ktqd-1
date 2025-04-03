'use client';

import { Calendar, MapPin, Briefcase, Store, MessageSquare } from 'lucide-react';
import { ContentType } from './types';

interface ContentNavigationProps {
  selectedType: ContentType;
  onTypeChange: (type: ContentType) => void;
}

export default function ContentNavigation({ selectedType, onTypeChange }: ContentNavigationProps) {
  const contentTypes = [
    { type: 'posts', label: 'Publications', icon: <MessageSquare size={20} /> },
    { type: 'events', label: 'Événements', icon: <Calendar size={20} /> },
    { type: 'places', label: 'Lieux', icon: <MapPin size={20} /> },
    { type: 'opportunities', label: 'Opportunités', icon: <Briefcase size={20} /> },
    { type: 'shops', label: 'Boutiques', icon: <Store size={20} /> }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Contenu</h2>
      </div>
      <div className="p-2">
        {contentTypes.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => onTypeChange(type as ContentType)}
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