'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getEventTypeLabel } from '@/lib/event-types';
import ImageViewer from '@/components/ui/ImageViewer';

interface EventHeaderProps {
  title: string;
  startDate: string;
  mainMedia: string;
  type: string;
}

export default function EventHeader({ 
  title, 
  startDate,
  mainMedia,
  type
}: EventHeaderProps) {
  const [showImageViewer, setShowImageViewer] = useState(false);

  return (
    <>
      <div className="w-full h-[400px] rounded-xl overflow-hidden mb-6 relative">
        <img
          src={mainMedia}
          alt={title}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setShowImageViewer(true)}
        />
        <div className="absolute top-2 right-2 bg-black/60 text-white text-md px-2 py-1 rounded">
          {getEventTypeLabel(type)}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <div className="flex items-center gap-2 text-sm text-white/90">
            <Calendar size={16} className="hidden sm:block" />
            <span>
              {format(new Date(startDate), 'dd MMMM yyyy', { locale: fr })}
            </span>
          </div>
        </div>
      </div>

      {showImageViewer && (
        <ImageViewer
          src={mainMedia}
          alt={title}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </>
  );
}