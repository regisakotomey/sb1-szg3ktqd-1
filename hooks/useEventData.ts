'use client';

import { useState, useEffect } from 'react';
import { getUserData } from '@/lib/storage';
import { Event } from '@/types/event';

export function useEventData(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isEventInterested, setIsEventInterested] = useState(false);
  const [isOrganizerFollowing, setIsOrganizerFollowing] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const userData = getUserData();
        const response = await fetch(`/api/events/get?id=${eventId}&currentUserId=${userData?.id || ''}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération de l\'événement');
        }
        const eventData = await response.json();
        
        setEvent(eventData);
        
        if (userData) {
          if (eventData.userId === userData.id) {
            setIsOwner(true);
          }

          if (eventData.interests) {
            const isUserInterested = eventData.interests.some(
              (interest: any) => interest.userId === userData.id
            );
            setIsEventInterested(isUserInterested);
          }

          if (eventData.organizer) {
            setIsOrganizerFollowing(eventData.organizer.isFollowed);
          }

          if (eventData.userId !== userData.id) {
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

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  return {
    event,
    loading,
    error,
    isOwner,
    isEventInterested,
    isOrganizerFollowing,
    setIsEventInterested,
    setIsOrganizerFollowing
  };
}