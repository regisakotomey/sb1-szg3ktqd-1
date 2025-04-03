'use client';

import { Calendar, MapPin, Briefcase, Store, MessageSquare } from 'lucide-react';
import { ContentType } from '../sections/types';

interface ContentNavigationProps {
  selectedType: ContentType;
  onTypeChange: (type: ContentType) => void;
}

export default function ContentNavigation({ selectedType, onTypeChange }: ContentNavigationProps) {
  const contentTypes = [
    { type: 'posts', label: 'Posts', icon: <MessageSquare size={20} /> },
    { type: 'events', label: 'Évén.', icon: <Calendar size={20} /> },
    { type: 'places', label: 'Lieux', icon: <MapPin size={20} /> },
    { type: 'opportunities', label: 'Opp.', icon: <Briefcase size={20} /> },
    { type: 'shops', label: 'Bout.', icon: <Store size={20} /> }
  ];

  return (
    <div className="border-t border-gray-200">
      <div className="flex overflow-x-auto hide-scrollbar">
        {contentTypes.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => onTypeChange(type as ContentType)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 min-w-[72px] text-xs font-medium border-b-2 transition-colors ${
              selectedType === type
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600'
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