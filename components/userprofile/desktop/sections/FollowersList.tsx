'use client';

import { User, MessageSquare, Bell } from 'lucide-react';
import { Follower } from './types';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';

interface FollowersListProps {
  followers: Follower[];
  onShowAllClick: () => void;
  onFollowClick: (followerId: string) => void;
  onMessageClick: (followerId: string) => void;
}

export default function FollowersList({
  followers,
  onShowAllClick,
  onFollowClick,
  onMessageClick
}: FollowersListProps) {
  const router = useRouter();
  const currentUser = getUserData();

  const handleFollowerClick = (followerId: string) => {
    router.push(`/userprofile/${followerId}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Abonnés récents</h2>
          <button
            onClick={onShowAllClick}
            className="text-primary hover:text-primary-hover text-sm"
          >
            Voir tout
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {followers.slice(0, 5).map((follower) => (
            <div
              key={follower.id}
              className="flex items-center justify-between gap-4"
            >
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => handleFollowerClick(follower.id)}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {follower.avatar ? (
                    <img
                      src={follower.avatar}
                      alt={follower.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{follower.name}</h3>
                  {follower.bio && (
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {follower.bio}
                    </p>
                  )}
                </div>
              </div>
              {currentUser?.id !== follower.id && (
                follower.isFollowing ? (
                  <button
                    onClick={() => onMessageClick(follower.id)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <MessageSquare size={14} />
                    <span>Message</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onFollowClick(follower.id)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Bell size={14} />
                    <span>Suivre</span>
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}