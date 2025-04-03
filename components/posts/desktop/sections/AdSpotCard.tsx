'use client';

import { useEffect } from 'react';
import { Play } from 'lucide-react';
import { getPlaceTypeLabel } from '@/lib/place-types';
import { getShopTypeLabel } from '@/lib/shop-types';
import { getUserData } from '@/lib/storage';

interface AdSpot {
  _id: string;
  placeId: string;
  shopId: string;
  media: Array<{
    url: string;
    caption: string;
  }>;
  creator?: {
    id: string;
    name: string;
    type: string;
  };
}

interface AdSpotCardProps {
  adSpot: AdSpot;
  onClick: () => void;
}

export default function AdSpotCard({ adSpot, onClick }: AdSpotCardProps) {
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
      onClick={onClick}
      className="flex-none w-[100px] cursor-pointer group"
    >
      <div className="aspect-[9/16] relative rounded-lg overflow-hidden">
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
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {/* Overlay avec les informations du créateur */}
        {adSpot.creator && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-2">
            <h3 className="text-white text-sm font-medium truncate">
              {adSpot.creator.name}
            </h3>
            <p className="text-white/80 text-xs">
              {adSpot.placeId 
                ? getPlaceTypeLabel(adSpot.creator.type)
                : getShopTypeLabel(adSpot.creator.type)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}