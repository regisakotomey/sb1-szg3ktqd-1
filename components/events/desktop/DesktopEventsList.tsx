'use client';

import { useCallback, useEffect, useState } from 'react';
import { FcCalendar, FcGlobe } from 'react-icons/fc';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Event } from '@/types/event';
import { getEventTypeLabel } from '@/lib/event-types';
import { getUserData } from '@/lib/storage';
import { useRouter } from 'next/navigation';

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
        console.log('View recorded for event:', event._id);
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
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"
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
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <FcCalendar size={14} />
            <span>
              {format(new Date(event.startDate), 'dd MMMM yyyy', { locale: fr })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FcGlobe size={14} />
            <span className="line-clamp-1">{event.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DesktopEventsList(){
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

  return (
    <main className="flex-1 pt-[60px] mx-auto w-full max-w-[550px] transition-all">
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-6">Événements à venir</h1>

        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun événement disponible pour le moment
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {events.map((event, index) => (
              <EventCard
                key={event._id}
                event={event}
                onEventClick={(id) => router.push(`/content/events/${id}`)}
                lastEventRef={index === events.length - 1 ? lastEventRef : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}