'use client';

import { User, Store, Bell } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';

interface AdSpotCreatorProps {
  creator: {
    id: string;
    name: string;
    followers: number;
    isFollowed: boolean;
    type: 'user' | 'place';
  };
  isOwner: boolean;
  isFollowing: boolean;
  onFollow: () => void;
}

export default function AdSpotCreator({
  creator,
  isOwner,
  isFollowing,
  onFollow
}: AdSpotCreatorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(creator.followers);
  const [isFollowed, setIsFollowed] = useState(isFollowing);

  const handleFollow = async () => {
    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = creator.type === 'place' 
        ? `/api/places/${creator.id}/follow`
        : `/api/users/${creator.id}/follow`;

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

  const handleCreatorClick = () => {
    if (creator.type === 'place') {
      router.push(`/content/places/${creator.id}`);
    } else {
      router.push(`/profile/${creator.id}`);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex justify-between items-center">
        <div 
          className="flex items-center gap-4 cursor-pointer"
          onClick={handleCreatorClick}
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            {creator.type === 'place' ? (
              <Store size={24} />
            ) : (
              <User size={24} />
            )}
          </div>
          <div>
            <h3 className="font-medium">{creator.name}</h3>
            <p className="text-sm text-gray-500">
              {followerCount} abonnés
            </p>
          </div>
        </div>
        {!isOwner && (
          <button
            onClick={handleFollow}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isFollowed
                ? 'bg-primary text-white hover:bg-primary-hover'
                : 'border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Bell size={20} />
                <span>{isFollowed ? 'Abonné' : "S'abonner"}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}