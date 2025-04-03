'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUserData } from '@/lib/storage';
import MobilePlaceView from './mobile/MobilePlaceView';
import DesktopPlaceView from './desktop/DesktopPlaceView';
import { Place } from '@/types/place';

export default function PlaceDetails() {
  const params = useParams();
  const router = useRouter();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isPlaceFollowing, setIsPlaceFollowing] = useState(false);
  const [isOrganizerFollowing, setIsOrganizerFollowing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');

  console.log("message : ", params.id);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchPlaceData = async () => {
      try {
        const userData = getUserData();
        const response = await fetch(`/api/places/get?id=${params.id}&currentUserId=${userData?.id || ''}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du lieu');
        }
        const placeData = await response.json();
        
        setPlace(placeData);
        
        if (userData) {
          // Check if user is owner
          if (placeData.organizer.type === 'user' && placeData.organizer.id === userData.id) {
            setIsOwner(true);
          }

          // Check if user is following the place
          if (placeData.followers) {
            const isUserFollowing = placeData.followers.some(
              (follow: any) => follow.userId === userData.id
            );
            setIsPlaceFollowing(isUserFollowing);
          }

          // Check if user is following the organizer
          if (placeData.organizer) {
            setIsOrganizerFollowing(placeData.organizer.isFollowed);
          }

          // Record view if not owner
          /*if (!isOwner) {
            await fetch(`/api/places/${placeData._id}/view`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: userData.id })
            });
          }*/
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPlaceData();
    }
  }, [params.id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place?.name,
        text: place?.description,
        url: window.location.href
      });
    }
  };

  const handleDelete = async () => {
    if (!place) return;

    try {
      const response = await fetch('/api/places/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeId: place._id,
          userId: getUserData()?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete place');
      }

      router.push('/content/places');
    } catch (err) {
      console.error('Error:', err);
      setError('Erreur lors de la suppression du lieu');
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

  if (error || !place) {
    return (
      <main className={`flex-1 ${isMobile ? 'pt-0' : 'pt-[76px]'} mx-auto w-full max-w-[800px] transition-all`}>
        <div className="p-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error || 'Lieu non trouvé'}
          </div>
        </div>
      </main>
    );
  }

  return isMobile ? (
    <MobilePlaceView
      place={place}
      isOwner={isOwner}
      isPlaceFollowing={isPlaceFollowing}
      isOrganizerFollowing={isOrganizerFollowing}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onBack={() => router.back()}
      onShare={handleShare}
      onSponsor={() => {}}
      onEdit={() => {}}
      onDelete={handleDelete}
      onReport={() => {}}
      onToggleFollow={setIsPlaceFollowing}
      onToggleOrganizerFollow={setIsOrganizerFollowing}
    />
  ) : (
    <DesktopPlaceView
      place={place}
      isOwner={isOwner}
      isPlaceFollowing={isPlaceFollowing}
      isOrganizerFollowing={isOrganizerFollowing}
      onShare={handleShare}
      onSponsor={() => {}}
      onEdit={() => {}}
      onDelete={handleDelete}
      onReport={() => {}}
      onToggleFollow={setIsPlaceFollowing}
      onToggleOrganizerFollow={setIsOrganizerFollowing}
    />
  );
}