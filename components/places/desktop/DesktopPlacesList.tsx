'use client';

import { useEffect } from 'react';
import { Store, Globe, MapPin } from 'lucide-react';
import { Place } from '@/types/place';
import { getPlaceTypeLabel } from '@/lib/place-types';
import { getUserData } from '@/lib/storage';

interface DesktopPlacesListProps {
  places: Place[];
  onPlaceClick: (id: string) => void;
  lastPlaceRef?: (node: HTMLDivElement) => void;
}

function PlaceCard({
  place,
  onPlaceClick,
  lastPlaceRef,
}: {
  place: Place;
  onPlaceClick: (id: string) => void;
  lastPlaceRef?: (node: HTMLDivElement) => void;
}) {
  useEffect(() => {
    const recordView = async () => {
      const userData = getUserData();
      if (!userData?.id) return;

      try {
        await fetch(`/api/places/${place._id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.id }),
        });
      } catch (error) {
        console.error('Error recording view:', error);
      }
    };

    recordView();
  }, [place._id]);

  return (
    <div
      ref={lastPlaceRef}
      onClick={() => onPlaceClick(place._id)}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"
    >
      <div className="aspect-video relative">
        {place.mainImage ? (
          <img
            src={place.mainImage}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Store size={48} className="text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {getPlaceTypeLabel(place.type)}
        </div>
      </div>

      <div className="p-2">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {place.name}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {place.shortDescription}
        </p>
      </div>
    </div>
  );
}

export default function DesktopPlacesList({
  places,
  onPlaceClick,
  lastPlaceRef,
}: DesktopPlacesListProps) {
  return (
    <main className="flex-1 pt-[60px] mx-auto w-full max-w-[550px] transition-all">
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-6">Lieux à découvrir</h1>

        {places.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun lieu disponible pour le moment
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {places.map((place, index) => (
              <PlaceCard
                key={place._id}
                place={place}
                onPlaceClick={onPlaceClick}
                lastPlaceRef={index === places.length - 1 ? lastPlaceRef : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
