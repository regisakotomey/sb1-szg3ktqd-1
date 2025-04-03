'use client';

import { User, Store, Bell, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';

interface ShopOrganizerProps {
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

export default function ShopOrganizer({
  organizer,
  isOwner,
  isFollowing,
  onFollow
}: ShopOrganizerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="bg-white rounded-lg">
      <div className="flex items-center gap-3">
        <div 
          onClick={handleOrganizerClick}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            {organizer.type === 'place' ? (
              organizer.logo ? (
                <img
                  src={organizer.logo}
                  alt={organizer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Store size={20} className="text-gray-500" />
                </div>
              )
            ) : (
              organizer.avatar ? (
                <img
                  src={organizer.avatar}
                  alt={organizer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <User size={20} className="text-gray-500" />
                </div>
              )
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-sm truncate">{organizer.name}</h3>
            <p className="text-xs text-gray-500">
              {organizer.followers} abonnés
            </p>
          </div>
        </div>
        {!isOwner && organizer.type === 'user' && (
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