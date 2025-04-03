'use client';

import { useCallback, useEffect, useState } from 'react';
import { Store, Globe, MapPin, ChevronLeft } from 'lucide-react';
import { Place } from '@/types/place';
import { getPlaceTypeLabel } from '@/lib/place-types';
import { getUserData } from '@/lib/storage';
import { useRouter } from 'next/navigation';

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
      className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="aspect-[16/9] relative">
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

      <div className="p-3 flex gap-3">
        {/* Logo */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-100">
          {place.logo ? (
            <img
              src={place.logo}
              alt={`Logo de ${place.name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
              <Store size={20} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {place.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-1">
            {place.shortDescription}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MobilePlacesList() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPlaces = useCallback(async (pageNum = 1) => {
    try {
      const response = await fetch(`/api/places/get?page=${pageNum}&limit=6`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des lieux');
      }
      const data = await response.json();
      
      if (pageNum === 1) {
        setPlaces(data.places);
      } else {
        setPlaces(prev => [...prev, ...data.places]);
      }
      
      setHasMore(pageNum < data.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaces(1);
  }, [fetchPlaces]);

  const lastPlaceRef = useCallback(
    (node: HTMLDivElement) => {
      if (!node || !hasMore || isLoadingMore) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsLoadingMore(true);
            fetchPlaces(page + 1);
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [fetchPlaces, hasMore, isLoadingMore, page]
  );

  if (loading) {
    return (
      <div className="h-screen overflow-y-auto">
        <main className="flex-1 mx-auto w-full max-w-[550px] hide-scrollbar">
          <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center h-14 px-4">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold ml-2">Lieux à découvrir</h1>
          </div>
        </div>
        <div className="space-y-2 p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </main>
      </div>
      
    );
  }

  if (error) {
    return (
      <main className="flex-1 mx-auto w-full max-w-[550px] transition-all">
        <div className="p-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </main>
    );
  }
  return (
    <div className="h-screen overflow-y-auto">
      <main className="flex-1 mx-auto w-full max-w-[550px] hide-scrollbar">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center h-14 px-4">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold ml-2">Lieux à découvrir</h1>
          </div>
        </div>

        {places.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun lieu disponible pour le moment
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {places.map((place, index) => (
              <PlaceCard
                key={place._id}
                place={place}
                onPlaceClick={(id) => router.push(`/content/places/${id}`)}
                lastPlaceRef={index === places.length - 1 ? lastPlaceRef : undefined}
              />
            ))}
            {isLoadingMore && hasMore &&(
              <div className="p-4">
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                      <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}