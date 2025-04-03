'use client';

import { User, MessageSquare, Bell } from 'lucide-react';
import { Follower } from './types';

interface FollowersModalProps {
  isOpen: boolean;
  followers: Follower[];
  onClose: () => void;
  onFollowClick: (followerId: string) => void;
  onMessageClick: (followerId: string) => void;
  lastFollowerRef?: (node: HTMLDivElement) => void;
  isLoadingMore?: boolean;
}

export default function FollowersModal({
  isOpen,
  followers,
  onClose,
  onFollowClick,
  onMessageClick,
  lastFollowerRef,
  isLoadingMore
}: FollowersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Abonnés</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-4">
            {followers.map((follower, index) => (
              <div
                key={follower.id}
                ref={index === followers.length - 1 ? lastFollowerRef : null}
                className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {follower.avatar ? (
                      <img
                        src={follower.avatar}
                        alt={follower.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{follower.name}</h3>
                    {follower.bio && (
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {follower.bio}
                      </p>
                    )}
                  </div>
                </div>
                {follower.isFollowing ? (
                  <button
                    onClick={() => onMessageClick(follower.id)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageSquare size={18} />
                    <span>Message</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onFollowClick(follower.id)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Bell size={18} />
                    <span>Suivre</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {isLoadingMore && (
            <div className="mt-6 flex justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}