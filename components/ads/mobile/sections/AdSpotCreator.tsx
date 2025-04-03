'use client';

import { User, Store, Bell, MessageSquare } from 'lucide-react';
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

  const handleMessage = () => {
    router.push(`/messages?userId=${creator.id}`);
  };

  const handleCreatorClick = () => {
    if (creator.type === 'place') {
      router.push(`/content/places/${creator.id}`);
    } else {
      router.push(`/profile/${creator.id}`);
    }
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center gap-3">
        <div 
          onClick={handleCreatorClick}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            {creator.type === 'place' ? (
              <Store size={20} className="text-gray-500" />
            ) : (
              <User size={20} className="text-gray-500" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-sm truncate">{creator.name}</h3>
            <p className="text-xs text-gray-500">
              {creator.followers} abonnés
            </p>
          </div>
        </div>
        {!isOwner && (
          <div className="flex gap-2">
            {isFollowing && (
              <button
                onClick={handleMessage}
                className="p-2 border border-gray-200 rounded-lg"
              >
                <MessageSquare size={18} className="text-gray-600" />
              </button>
            )}
            {!isFollowing && (
              <button
                onClick={onFollow}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
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