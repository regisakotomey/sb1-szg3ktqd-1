'use client';

import { useEffect } from 'react';
import { Play, Store, ChevronLeft } from 'lucide-react';
import { getUserData } from '@/lib/storage';
import { useRouter } from 'next/navigation';

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
      className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="aspect-[16/9] relative">
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

      <div className="p-2">
        {adSpot.creator && (
          <div className="flex items-center gap-2">
            <Store size={14} className="text-gray-500" />
            <span className="text-sm line-clamp-1 text-gray-700">
              {adSpot.creator.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MobileAdSpotsList() {
  const router = useRouter();
  const [adSpots, setAdSpots] = useState<AdSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchAdSpots = useCallback(async (pageNum = 1) => {
    try {
      const response = await fetch(`/api/ads/get?page=${pageNum}&limit=6`);
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
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchAdSpots(1);
  }, [fetchAdSpots]);

  const lastAdSpotRef = useCallback(
    (node: HTMLDivElement) => {
      if (!node || !hasMore || isLoadingMore) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsLoadingMore(true);
            fetchAdSpots(page + 1);
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [fetchAdSpots, hasMore, isLoadingMore, page]
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
              <h1 className="text-lg font-semibold ml-2">Spots publicitaires</h1>
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
      <div className="h-screen overflow-y-auto">
        <main className="flex-1 mx-auto w-full max-w-[550px] hide-scrollbar">
          <div className="p-4">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          </div>
        </main>
      </div>
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
            <h1 className="text-lg font-semibold ml-2">Spots publicitaires</h1>
          </div>
        </div>

        {adSpots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun spot publicitaire disponible pour le moment
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {adSpots.map((adSpot, index) => (
              <AdSpotCard
                key={adSpot._id}
                adSpot={adSpot}
                onAdSpotClick={(id) => router.push(`/content/ads/${id}`)}
                lastAdSpotRef={index === adSpots.length - 1 ? lastAdSpotRef : undefined}
              />
            ))}
            {lastAdSpotRef && hasMore && (
              <div className="p-4">
                <div className="space-y-2">
                  {[1, 2].map((i) => (
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