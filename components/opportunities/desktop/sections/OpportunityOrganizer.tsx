'use client';

import { User, Store, Bell, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';

interface OpportunityOrganizerProps {
  organizer: {
    type: 'user' | 'place';
    id: string;
    name?: string;
    avatar?: string;
    logo?: string;
    followers?: number;
    isFollowed?: boolean;
  };
  isOwner: boolean;
  isFollowing: boolean;
  onFollow: () => void;
}

export default function OpportunityOrganizer({
  organizer,
  isOwner,
  isFollowing,
  onFollow
}: OpportunityOrganizerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(organizer.followers || 0);
  const [isFollowed, setIsFollowed] = useState(isFollowing);

  const handleFollow = async () => {
    if (organizer.type !== 'user') return;

    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = `/api/users/${organizer.id}/follow`;
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
    if (organizer.type !== 'user') return;
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
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex justify-between items-center">
        <div 
          className="flex items-center gap-4 cursor-pointer"
          onClick={handleOrganizerClick}
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            {organizer.type === 'place' ? (
              organizer.logo ? (
                <img
                  src={organizer.logo}
                  alt={organizer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store size={24} className="text-gray-400" />
              )
            ) : (
              organizer.avatar ? (
                <img
                  src={organizer.avatar}
                  alt={organizer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={24} className="text-gray-400" />
              )
            )}
          </div>
          <div>
            <h3 className="font-medium">{organizer.name}</h3>
            <p className="text-sm text-gray-500">
              {followerCount} abonnés
            </p>
          </div>
        </div>
        {!isOwner && organizer.type === 'user' && (
          <div className="flex gap-2">
            {isFollowed && (
              <button
                onClick={handleMessage}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageSquare size={18} />
                <span>Message</span>
              </button>
            )}
            {!isFollowed && (
              <button
                onClick={handleFollow}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Bell size={18} />
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