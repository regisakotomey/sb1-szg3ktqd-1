'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

export default function AdSpots() {
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

  if (adSpots.length === 0 && !loading) return null;

  return (
    <div className="rounded-xl pl-8 pr-8 pt-4 pb-2">
      <div className="relative">
        <div 
          ref={containerRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-4"
        >
          {loading ? (
            // Loading skeletons
            Array(5).fill(0).map((_, i) => (
              <div
                key={i}
                className="flex-none w-[100px] animate-pulse"
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
                    className="flex-none w-[100px] animate-pulse"
                  >
                    <div className="aspect-[9/16] bg-gray-200 rounded-lg" />
                  </div>
                ))
              )}
            </>
          )}
        </div>

        <button
          onClick={() => scrollAdSpots('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={() => scrollAdSpots('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}