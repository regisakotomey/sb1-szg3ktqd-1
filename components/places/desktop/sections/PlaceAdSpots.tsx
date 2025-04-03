'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, ChevronLeft, ChevronRight, ImagePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdSpot {
  _id: string;
  media: Array<{
    url: string;
    caption: string;
  }>;
  createdAt: string;
}

interface PlaceAdSpotsProps {
  placeId: string;
  isOwner: boolean;
}

export default function PlaceAdSpots({ placeId, isOwner }: PlaceAdSpotsProps) {
  const router = useRouter();
  const [adSpots, setAdSpots] = useState<AdSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchAdSpots = useCallback(async (pageNum: number) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await fetch(`/api/ads/get?placeId=${placeId}&page=${pageNum}&limit=5`);
      if (!response.ok) throw new Error('Failed to fetch ad spots');
      
      const data = await response.json();
      if (pageNum === 1) {
        setAdSpots(data.adSpots);
      } else {
        setAdSpots(prev => [...prev, ...data.adSpots]);
      }
      setHasMore(pageNum < data.pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching ad spots:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [placeId]);

  useEffect(() => {
    fetchAdSpots(1);
  }, [fetchAdSpots]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
          fetchAdSpots(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchAdSpots, hasMore, isLoadingMore, page]);

  const scrollAdSpots = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <ImagePlus size={24} className="text-gray-500" />
            <h2 className="text-xl font-bold">Spots publicitaires</h2>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex-none w-[300px] animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <ImagePlus size={24} className="text-gray-500" />
          <h2 className="text-xl font-bold">Spots publicitaires</h2>
        </div>
        {isOwner && (
          <button
            onClick={() => router.push(`/content/places/${placeId}/ads/add`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <ImagePlus size={18} />
            <span>Créer un spot</span>
          </button>
        )}
      </div>

      {adSpots.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun spot publicitaire n'est disponible
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => scrollAdSpots('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <div 
            ref={containerRef}
            className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {adSpots.map((adSpot, index) => (
              <div
                key={adSpot._id}
                ref={index === adSpots.length - 1 ? observerTarget : null}
                onClick={() => router.push(`/content/ads/${adSpot._id}`)}
                className="flex-none w-[300px] cursor-pointer group"
              >
                <div className="aspect-video relative rounded-lg overflow-hidden">
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
                </div>
              </div>
            ))}

            {isLoadingMore && (
              <div className="flex-none w-[300px] animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-lg" />
              </div>
            )}
          </div>

          <button
            onClick={() => scrollAdSpots('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
}