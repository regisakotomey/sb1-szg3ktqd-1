'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdSpot {
  media: Array<{
    url: string;
    caption: string;
  }>;
}

interface AdSpotHeaderProps {
  adSpot: AdSpot;
}

export default function AdSpotHeader({ adSpot }: AdSpotHeaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="relative">
      {adSpot.media[currentIndex].url.includes('.mp4') ? (
        <video
          src={adSpot.media[currentIndex].url}
          controls
          className="w-full h-[50vh] object-cover"
        />
      ) : (
        <img
          src={adSpot.media[currentIndex].url}
          alt={adSpot.media[currentIndex].caption}
          className="w-full h-[50vh] object-cover"
        />
      )}

      {adSpot.media.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + adSpot.media.length) % adSpot.media.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % adSpot.media.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {adSpot.media[currentIndex].caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="text-white text-sm">
            {adSpot.media[currentIndex].caption}
          </p>
        </div>
      )}
    </div>
  );
}