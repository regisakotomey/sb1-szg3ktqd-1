'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdSpot {
  _id: string;
  media: Array<{
    url: string;
    caption: string;
  }>;
  createdAt: string;
}

interface ShopAdSpotsProps {
  shopId: string;
}

export default function ShopAdSpots({ shopId }: ShopAdSpotsProps) {
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
      const response = await fetch(`/api/ads/get?shopId=${shopId}&page=${pageNum}&limit=5`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des spots');
      
      const data = await response.json();
      if (pageNum === 1) {
        setAdSpots(data.adSpots);
      } else {
        setAdSpots(prev => [...prev, ...data.adSpots]);
      }
      setHasMore(pageNum < data.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching ad spots:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [shopId]);

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Spots publicitaires</h3>
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-none w-[80px] aspect-[9/16] bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (adSpots.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Spots publicitaires</h3>
        <button
          onClick={() => router.push(`/content/shops/${shopId}/ads`)}
          className="flex items-center gap-1 text-xs text-primary"
        >
          Voir tout
          <ChevronRight size={14} />
        </button>
      </div>

      <div 
        ref={containerRef}
        className="flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth"
      >
        {adSpots.map((adSpot, index) => (
          <div
            key={adSpot._id}
            ref={index === adSpots.length - 1 ? observerTarget : null}
            onClick={() => router.push(`/content/ads/${adSpot._id}`)}
            className="flex-none w-[80px] cursor-pointer"
          >
            <div className="aspect-[9/16] relative rounded-lg overflow-hidden">
              {adSpot.media[0].url.endsWith('.mp4') ? (
                <>
                  <video
                    src={adSpot.media[0].url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <img
                  src={adSpot.media[0].url}
                  alt={adSpot.media[0].caption || 'Spot publicitaire'}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        ))}

        {isLoadingMore && (
          <div className="flex-none w-[80px] aspect-[9/16] bg-gray-200 rounded-lg animate-pulse"></div>
        )}
      </div>
    </div>
  );
}