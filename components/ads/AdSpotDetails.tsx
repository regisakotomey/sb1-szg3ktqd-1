'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUserData } from '@/lib/storage';
import MobileAdSpotView from './mobile/MobileAdSpotView';
import DesktopAdSpotView from './desktop/DesktopAdSpotView';

interface AdSpot {
  _id: string;
  media: Array<{
    url: string;
    caption: string;
  }>;
  userId: string;
  placeId?: string;
  views: Array<{ userId: string; viewedAt: string }>;
  creator?: {
    id: string;
    name: string;
    followers: number;
    isFollowed: boolean;
    type: 'user' | 'place';
  };
}

export default function AdSpotDetails() {
  const params = useParams();
  const router = useRouter();
  const [adSpot, setAdSpot] = useState<AdSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isCreatorFollowing, setIsCreatorFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
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

  useEffect(() => {
    const fetchAdSpotAndCreator = async () => {
      try {
        const userData = getUserData();
        const response = await fetch(`/api/ads/get?id=${params.id}&currentUserId=${userData?.id || ''}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du spot publicitaire');
        }
        const adSpotData = await response.json();
        
        setAdSpot(adSpotData);
        
        if (userData) {
          // Check if user is owner
          if (adSpotData.userId === userData.id) {
            setIsOwner(true);
          }

          // Check if user is following the creator
          if (adSpotData.creator) {
            setIsCreatorFollowing(adSpotData.creator.isFollowed);
          }

          // Record view if not owner
          if (adSpotData.userId !== userData.id) {
            await fetch(`/api/ads/${adSpotData._id}/view`, {
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
      fetchAdSpotAndCreator();
    }
  }, [params.id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Spot publicitaire',
        text: adSpot?.media[currentMediaIndex].caption,
        url: window.location.href
      });
    }
  };

  const handleDelete = async () => {
    if (!adSpot) return;

    try {
      const response = await fetch('/api/ads/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adSpotId: adSpot._id,
          userId: getUserData()?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete ad spot');
      }

      router.push('/content/ads');
    } catch (err) {
      console.error('Error:', err);
      setError('Erreur lors de la suppression du spot publicitaire');
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

  if (error || !adSpot) {
    return (
      <main className={`flex-1 ${isMobile ? 'pt-0' : 'pt-[76px]'} mx-auto w-full max-w-[800px] transition-all`}>
        <div className="p-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error || 'Spot publicitaire non trouvé'}
          </div>
        </div>
      </main>
    );
  }

  return isMobile ? (
    <MobileAdSpotView
      adSpot={adSpot}
      isOwner={isOwner}
      isCreatorFollowing={isCreatorFollowing}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onBack={() => router.back()}
      onShare={handleShare}
      onSponsor={() => {}}
      onEdit={() => {}}
      onDelete={handleDelete}
      onReport={() => {}}
      onToggleFollow={setIsCreatorFollowing}
    />
  ) : (
    <DesktopAdSpotView
      adSpot={adSpot}
      isOwner={isOwner}
      isCreatorFollowing={isCreatorFollowing}
      currentMediaIndex={currentMediaIndex}
      onChangeMedia={setCurrentMediaIndex}
      onShare={handleShare}
      onSponsor={() => {}}
      onEdit={() => {}}
      onDelete={handleDelete}
      onReport={() => {}}
      onToggleFollow={setIsCreatorFollowing}
    />
  );
}