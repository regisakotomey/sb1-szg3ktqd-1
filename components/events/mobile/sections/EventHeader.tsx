'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getEventTypeLabel } from '@/lib/event-types';
import { Event } from '@/types/event';
import { useState } from 'react';
import ImageViewer from '@/components/ui/ImageViewer';

interface EventHeaderProps {
  event: Event;
}

export default function EventHeader({ event }: EventHeaderProps) {
  const [showImageViewer, setShowImageViewer] = useState(false);

  return (
    <>
      <div className="relative">
        <img
          src={event.mainMedia}
          alt={event.title}
          className="w-full h-[50vh] object-cover"
          onClick={() => setShowImageViewer(true)}
        />
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {getEventTypeLabel(event.type)}
        </div>
        {/* Gradient overlay with stronger opacity and larger height */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent  pointer-events-none">
          {/* Content container positioned at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3  pointer-events-none">
            <div className="text-white">
              <div className="text-sm font-medium opacity-90 mb-2">
                {format(new Date(event.startDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </div>
              <h1 className="text-md font-bold text-white">
                {event.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {showImageViewer && (
        <ImageViewer
          src={event.mainMedia}
          alt={event.title}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </>
  );
}