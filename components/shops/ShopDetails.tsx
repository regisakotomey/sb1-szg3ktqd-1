'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUserData } from '@/lib/storage';
import MobileShopView from './mobile/MobileShopView';
import DesktopShopView from './desktop/DesktopShopView';
import { Shop } from '@/types/shop';

export default function ShopDetails() {
  const params = useParams();
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isShopFollowing, setIsShopFollowing] = useState(false);
  const [isOrganizerFollowing, setIsOrganizerFollowing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'details' | 'comments'>('products');

  // Check if user is the owner of the place that organized the shop
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
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const userData = getUserData();
        const response = await fetch(`/api/shops/get?id=${params.id}&currentUserId=${userData?.id || ''}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération de la boutique');
        }
        const shopData = await response.json();
        
        setShop(shopData);
        
        if (userData) {
          // Check ownership based on both direct ownership and place ownership
          let isShopOwner = false;
          
          if (shopData.organizer.type === 'user') {
            // Direct user ownership
            isShopOwner = shopData.organizer.id === userData.id;
          } else if (shopData.organizer.type === 'place') {
            // Check if user owns the place that created the shop
            isShopOwner = await checkPlaceOwnership(shopData.organizer.id, userData.id);
          }
          
          setIsOwner(isShopOwner);

          // Check if user is following the shop
          if (shopData.followers) {
            const isUserFollowing = shopData.followers.some(
              (follow: any) => follow.userId === userData.id
            );
            setIsShopFollowing(isUserFollowing);
          }

          // Check if user is following the organizer
          if (shopData.organizer) {
            setIsOrganizerFollowing(shopData.organizer.isFollowed);
          }

          // Record view if not owner
          if (!isShopOwner) {
            await fetch(`/api/shops/${shopData._id}/view`, {
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
      fetchShopData();
    }
  }, [params.id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: shop?.name,
        text: shop?.description,
        url: window.location.href
      });
    }
  };

  const handleDelete = async () => {
    if (!shop) return;

    try {
      const response = await fetch('/api/shops/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopId: shop._id,
          userId: getUserData()?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete shop');
      }

      router.push('/content/shops');
    } catch (err) {
      console.error('Error:', err);
      setError('Erreur lors de la suppression de la boutique');
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

  if (error || !shop) {
    return (
      <main className={`flex-1 ${isMobile ? 'pt-0' : 'pt-[76px]'} mx-auto w-full max-w-[800px] transition-all`}>
        <div className="p-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error || 'Boutique non trouvée'}
          </div>
        </div>
      </main>
    );
  }

  return isMobile ? (
    <MobileShopView
      shop={shop}
      isOwner={isOwner}
      isShopFollowing={isShopFollowing}
      isOrganizerFollowing={isOrganizerFollowing}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onBack={() => router.back()}
      onShare={handleShare}
      onSponsor={() => {}}
      onEdit={() => {}}
      onDelete={handleDelete}
      onReport={() => {}}
      onToggleFollow={setIsShopFollowing}
      onToggleOrganizerFollow={setIsOrganizerFollowing}
    />
  ) : (
    <DesktopShopView
      shop={shop}
      isOwner={isOwner}
      isShopFollowing={isShopFollowing}
      isOrganizerFollowing={isOrganizerFollowing}
      onShare={handleShare}
      onSponsor={() => {}}
      onEdit={() => {}}
      onDelete={handleDelete}
      onReport={() => {}}
      onToggleFollow={setIsShopFollowing}
      onToggleOrganizerFollow={setIsOrganizerFollowing}
    />
  );
}