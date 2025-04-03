'use client';

import { useCallback, useEffect, useState } from 'react';
import { FcCalendar, FcGlobe } from 'react-icons/fc';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Event } from '@/types/event';
import { getEventTypeLabel } from '@/lib/event-types';
import { getUserData } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

function EventCard({
  event,
  onEventClick,
  lastEventRef,
}: {
  event: Event;
  onEventClick: (id: string) => void;
  lastEventRef?: (node: HTMLDivElement) => void;
}) {
  useEffect(() => {
    const recordView = async () => {
      const userData = getUserData();
      if (!userData?.id) return;

      try {
        await fetch(`/api/events/${event._id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.id }),
        });
      } catch (error) {
        console.error('Error recording view:', error);
      }
    };

    recordView();
  }, [event._id]);

  return (
    <div
      ref={lastEventRef}
      onClick={() => onEventClick(event._id)}
      className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="aspect-video relative">
        <img
          src={event.mainMedia}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {getEventTypeLabel(event.type)}
        </div>
      </div>

      <div className="p-2 flex items-center gap-4">
        <div className="flex items-center justify-center border border-gray-400 rounded px-1 text-sm text-gray-600">
          <span className="text-center">{format(new Date(event.startDate), 'dd MMMM', { locale: fr })}</span>
        </div>

        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
          {event.title}
        </h3>
      </div>
    </div>
  );
}

export default function MobileEventsList() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchEvents = useCallback(async (pageNum: number) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await fetch(`/api/events/get?page=${pageNum}&limit=6`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des événements');

      const data = await response.json();

      if (pageNum === 1) {
        setEvents(data.events);
      } else {
        setEvents((prev) => [...prev, ...data.events]);
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
    fetchEvents(1);
  }, [fetchEvents]);

  const lastEventRef = useCallback(
    (node: HTMLDivElement) => {
      if (!node || !hasMore || isLoadingMore) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchEvents(page + 1);
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [fetchEvents, hasMore, isLoadingMore, page]
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
              <h1 className="text-lg font-semibold ml-2">Événements à venir</h1>
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
      <div className="h-screen overflow-y-auto ">
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
            <h1 className="text-lg font-semibold ml-2">Événements à venir</h1>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun événement disponible pour le moment
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {events.map((event, index) => (
              <EventCard
                key={event._id}
                event={event}
                onEventClick={(id) => router.push(`/content/events/${id}`)}
                lastEventRef={index === events.length - 1 ? lastEventRef : undefined}
              />
            ))}
            {isLoadingMore && hasMore && (
              <div className="p-4">
                <div className={`grid grid-cols-1 gap-4`}>
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