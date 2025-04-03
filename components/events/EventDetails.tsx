'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUserData } from '@/lib/storage';
import MobileEventView from './mobile/MobileEventView';
import DesktopEventView from './desktop/DesktopEventView';
import { Event } from '@/types/event';

export default function EventDetails() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isEventInterested, setIsEventInterested] = useState(false);
  const [isOrganizerFollowing, setIsOrganizerFollowing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if user is the owner of the place that organized the event
  const checkPlaceOwnership = async (placeId: string, userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/places/${placeId}?currentUserId=${userId}`);
      if (!response.ok) return false;

      const placeData = await response.json();
      return placeData.organizer?.type === 'user' && placeData.organizer?.id === userId;
    } catch (error) {
      console.error('Error checking place ownership:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const userData = getUserData();
        const response = await fetch(`/api/events/get?id=${params.id}&currentUserId=${userData?.id || ''}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération de l\'événement');
        }
        const eventData = await response.json();
        
        setEvent(eventData);
        
        if (userData) {
          // Check ownership based on both direct ownership and place ownership
          let isEventOwner = false;
          
          if (eventData.organizer.type === 'user') {
            // Direct user ownership
            isEventOwner = eventData.organizer.id === userData.id;
          } else if (eventData.organizer.type === 'place') {
            // Check if user owns the place that created the event
            isEventOwner = await checkPlaceOwnership(eventData.organizer.id, userData.id);
          }
          
          setIsOwner(isEventOwner);

          // Check if user is interested in event
          if (eventData.interests) {
            const isUserInterested = eventData.interests.some(
              (interest: any) => interest.userId === userData.id
            );
            setIsEventInterested(isUserInterested);
          }

          // Check if user is following the organizer
          if (eventData.organizer) {
            setIsOrganizerFollowing(eventData.organizer.isFollowed);
          }

          // Record view if not owner
          if (!isEventOwner) {
            await fetch(`/api/events/${eventData._id}/view`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: userData.id })
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEventData();
    }
  }, [params.id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href
      });
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    try {
      const response = await fetch('/api/events/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event._id,
          userId: getUserData()?.id
        }),
      });

      if (!response.ok) throw new Error('Failed to delete event');

      router.push('/content/events');
    } catch (err) {
      console.error('Error:', err);
      setError('Erreur lors de la suppression de l\'événement');
    }
  };

  if (loading) {
    return (
      <main className={`flex-1 ${isMobile ? 'pt-0' : 'pt-[76px]'} mx-auto w-full max-w-[800px] transition-all`}>
        <div className="animate-pulse">
          <div className="w-full h-[300px] sm:h-[400px] bg-gray-200"></div>
          <div className="p-4 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className={`flex-1 ${isMobile ? 'pt-0' : 'pt-[76px]'} mx-auto w-full max-w-[800px] transition-all`}>
        <div className="p-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error || 'Événement non trouvé'}
          </div>
        </div>
      </main>
    );
  }

  return isMobile ? (
    <MobileEventView
      event={event}
      isOwner={isOwner}
      isEventInterested={isEventInterested}
      isOrganizerFollowing={isOrganizerFollowing}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onBack={() => router.back()}
      onShare={handleShare}
      onSponsor={() => {}}
      onEdit={() => {}}
      onDelete={handleDelete}
      onReport={() => {}}
      onToggleInterest={setIsEventInterested}
      onToggleFollow={setIsOrganizerFollowing}
    />
  ) : (
    <DesktopEventView
      event={event}
      isOwner={isOwner}
      isEventInterested={isEventInterested}
      isOrganizerFollowing={isOrganizerFollowing}
      onShare={handleShare}
      onSponsor={() => {}}
      onEdit={() => {}}
      onDelete={handleDelete}
      onReport={() => {}}
      onToggleInterest={setIsEventInterested}
      onToggleFollow={setIsOrganizerFollowing}
    />
  );
}