'use client';

import { User, Store, Bell, MessageSquare, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';

interface EventOrganizerProps {
  organizer: {
    type: 'user' | 'place';
    id: string;
    name: string;
    avatar?: string;
    logo?: string;
    followers: number;
    isFollowed: boolean;
  };
  isOwner: boolean;
  isFollowing: boolean;
  onFollow: () => void;
}

export default function EventOrganizer({
  organizer,
  isOwner,
  isFollowing,
  onFollow
}: EventOrganizerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(organizer.followers);
  const [isFollowed, setIsFollowed] = useState(isFollowing);
  const [isMobile] = useState(() => window.innerWidth < 768);

  const handleFollow = async () => {
    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = organizer.type === 'place' 
        ? `/api/places/${organizer.id}/follow`
        : `/api/users/${organizer.id}/follow`;

      const response = await fetch(endpoint, {
        method: isFollowed ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update follow status');
      }

      const data = await response.json();
      setFollowerCount(data.followers);
      setIsFollowed(data.isFollowed);
      onFollow();
    } catch (error) {
      console.error('Error updating follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = () => {
    router.push(`/messages?userId=${organizer.id}`);
  };

  const handleOrganizerClick = () => {
    if (organizer.type === 'place') {
      router.push(`/content/places/${organizer.id}`);
    } else {
      router.push(`/userprofile/${organizer.id}`);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
      <div className="flex justify-between items-center">
        <div 
          onClick={handleOrganizerClick}
          className="flex items-center gap-3 sm:gap-4 cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            {organizer.type === 'place' ? (
              organizer.logo ? (
                <img 
                  src={organizer.logo} 
                  alt={organizer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <MapPin size={isMobile ? 20 : 24} className="text-gray-400" />
              )
            ) : (
              organizer.avatar ? (
                <img 
                  src={organizer.avatar} 
                  alt={organizer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={isMobile ? 20 : 24} className="text-gray-400" />
              )
            )}
          </div>
          <div>
            <h3 className="font-medium text-sm sm:text-base">{organizer.name}</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {followerCount} abonnés
            </p>
          </div>
        </div>
        {!isOwner && organizer.type === 'user' && (
          <div className="flex gap-2">
            {isFollowed && (
              <button
                onClick={handleMessage}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <MessageSquare size={16} />
                <span className="hidden sm:inline">Message</span>
              </button>
            )}
            {!isFollowed && (
              <button
                onClick={handleFollow}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors border border-gray-200 hover:bg-gray-50 text-sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Bell size={16} />
                    <span>S'abonner</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}