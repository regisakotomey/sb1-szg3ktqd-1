'use client';

import { useEffect } from 'react';
import { Play } from 'lucide-react';
import { getUserData } from '@/lib/storage';

interface AdSpot {
  _id: string;
  media: Array<{
    url: string;
    caption: string;
  }>;
  creator?: {
    id: string;
    name: string;
    type: string;
  };
  createdAt: string;
}

interface DesktopAdSpotsListProps {
  adSpots: AdSpot[];
  onAdSpotClick: (id: string) => void;
  lastAdSpotRef?: (node: HTMLDivElement) => void;
}

function AdSpotCard({
  adSpot,
  onAdSpotClick,
  lastAdSpotRef,
}: {
  adSpot: AdSpot;
  onAdSpotClick: (id: string) => void;
  lastAdSpotRef?: (node: HTMLDivElement) => void;
}) {
  useEffect(() => {
    const recordView = async () => {
      const userData = getUserData();
      if (!userData?.id) return;

      try {
        await fetch(`/api/ads/${adSpot._id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.id }),
        });
      } catch (error) {
        console.error('Error recording view:', error);
      }
    };

    recordView();
  }, [adSpot._id]);

  return (
    <div
      ref={lastAdSpotRef}
      onClick={() => onAdSpotClick(adSpot._id)}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"
    >
      <div className="aspect-video relative">
        {adSpot.media[0].url.endsWith('.mp4') ? (
          <>
            <video
              src={adSpot.media[0].url}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Play className="w-12 h-12 text-white" />
            </div>
          </>
        ) : (
          <img
            src={adSpot.media[0].url}
            alt={adSpot.media[0].caption || ''}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="p-4">
        {adSpot.creator && (
          <div className="flex items-center gap-2">
            <span className="text-sm line-clamp-1 text-gray-700">
              {adSpot.creator.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DesktopAdSpotsList({
  adSpots,
  onAdSpotClick,
  lastAdSpotRef,
}: DesktopAdSpotsListProps) {
  return (
    <main className="flex-1 pt-[60px] mx-auto w-full max-w-[550px] transition-all">
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-6">Spots publicitaires</h1>

        {adSpots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun spot publicitaire disponible pour le moment
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {adSpots.map((adSpot, index) => (
              <AdSpotCard
                key={adSpot._id}
                adSpot={adSpot}
                onAdSpotClick={onAdSpotClick}
                lastAdSpotRef={index === adSpots.length - 1 ? lastAdSpotRef : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}