'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import AdSpotCard from './AdSpotCard';
import { useRouter } from 'next/navigation';

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

export default function AdsSpots() {
  const router = useRouter();
  const [adSpots, setAdSpots] = useState<AdSpot[]>([]);
  const [loading, setLoading] = useState(true);
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
      const response = await fetch(`/api/ads/get?page=${pageNum}&limit=10`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des spots publicitaires');
      
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
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

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

  if (adSpots.length === 0 && !loading) return null;

  return (
    <div className="px-4 pt-4 pb-2">
      <div 
        ref={containerRef}
        className="flex gap-2 overflow-x-auto hide-scrollbar pb-4"
      >
        {loading ? (
          // Loading skeletons
          Array(5).fill(0).map((_, i) => (
            <div
              key={i}
              className="flex-none w-[80px] animate-pulse"
            >
              <div className="aspect-[9/16] bg-gray-200 rounded-lg" />
            </div>
          ))
        ) : (
          <>
            {adSpots.map((adSpot, index) => (
              <AdSpotCard
                key={adSpot._id}
                adSpot={adSpot}
                onClick={() => router.push(`/content/ads/${adSpot._id}`)}
                ref={index === adSpots.length - 1 ? observerTarget : null}
              />
            ))}
            {isLoadingMore && (
              // Loading more skeletons
              Array(2).fill(0).map((_, i) => (
                <div
                  key={`loading-${i}`}
                  className="flex-none w-[80px] animate-pulse"
                >
                  <div className="aspect-[9/16] bg-gray-200 rounded-lg" />
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}