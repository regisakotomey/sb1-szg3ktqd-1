'use client';

import { useState } from 'react';
import { User, MessageSquare, Bell, ChevronLeft, MoreVertical, Edit, DollarSign, LogOut, Flag } from 'lucide-react';
import { UserProfileData } from '../sections/types';
import { getBusinessSectorLabel } from '@/lib/business-sectors';
import { getCountryByCode } from '@/lib/countries';

interface ProfileHeaderProps {
  user: UserProfileData;
  isOwnProfile: boolean;
  onBack: () => void;
  onFollow: () => void;
  onMessage: () => void;
  onLogout: () => void;
  onReport: () => void;
  onEdit?: () => void;
  onSponsor?: () => void;
  isFollowLoading: boolean;
}

export default function ProfileHeader({
  user,
  isOwnProfile,
  onBack,
  onFollow,
  onMessage,
  onLogout,
  onReport,
  onEdit,
  onSponsor,
  isFollowLoading
}: ProfileHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white">
      {/* Cover Image */}
      <div className="relative h-32 bg-gradient-to-r from-primary to-primary-hover">
        {user.coverImage && (
          <img
            src={user.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button
            onClick={onBack}
            className="p-2 bg-white/20 rounded-full text-white backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 bg-white/20 rounded-full text-white backdrop-blur-sm"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="relative px-4 pb-4">
        {/* Avatar */}
        <div className="absolute -top-16 left-4">
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <User size={32} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="pt-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-500 text-sm">
                {getBusinessSectorLabel(user.sector ?? "unknown")}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                {getCountryByCode(user.country_code)?.name || "Unknown Country"}
              </p>
              <div className="flex gap-4 mt-2">
                <span className="text-sm">
                  <span className="font-semibold">{user.followers}</span>
                  <span className="text-gray-500 ml-1">abonnés</span>
                </span>
                <span className="text-sm">
                  <span className="font-semibold">{user.following}</span>
                  <span className="text-gray-500 ml-1">abonnements</span>
                </span>
              </div>
            </div>

            {!isOwnProfile && (
              <div className="flex flex-col gap-2">
              <button
                onClick={onFollow}
                disabled={isFollowLoading}
                className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-200 hover:bg-black text-black rounded-lg text-sm"
              >
                {isFollowLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{user.isFollowed ? 'Se désabonner' : "S'abonner"}</span>
                  </>
                )}
              </button>
              {user.isFollowed && (
                <button
                  onClick={onMessage}
                  className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-sm"
                >
                  <span>Message</span>
                </button>
              )}
            </div>
            
            )}
          </div>
        </div>
      </div>

      {/* Menu Dialog */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-50 overflow-hidden">
            <div className="p-2">
              {isOwnProfile ? (
                <>
                  {onSponsor && (
                    <button
                      onClick={() => {
                        onSponsor();
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full p-4 hover:bg-gray-50 text-left"
                    >
                      <DollarSign size={20} className="text-purple-600" />
                      <span>Sponsoriser</span>
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit();
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full p-4 hover:bg-gray-50 text-left"
                    >
                      <Edit size={20} className="text-gray-900" />
                      <span>Modifier</span>
                    </button>
                  )}
                  <div className="h-px bg-gray-100 my-2" />
                  <button
                    onClick={() => {
                      onLogout();
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-3 w-full p-4 hover:bg-gray-50 text-red-600 text-left"
                  >
                    <LogOut size={20} />
                    <span>Déconnexion</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onReport();
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-3 w-full p-4 hover:bg-gray-50 text-left"
                >
                  <Flag size={20} />
                  <span>Signaler</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}