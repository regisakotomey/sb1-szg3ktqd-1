'use client';

import { Eye, Bell, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface FollowingUser {
  id: string;
  name: string;
  followedAt: string;
}

interface PlaceStatisticsProps {
  placeId: string;
  viewCount: number;
  followCount: number;
  onSponsor: () => void;
}

export default function PlaceStatistics({
  placeId,
  viewCount,
  followCount,
  onSponsor
}: PlaceStatisticsProps) {
  const router = useRouter();
  const [showFollowingUsers, setShowFollowingUsers] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(false);

  const handleShowFollowingUsers = async () => {
    if (!showFollowingUsers) {
      setLoading(true);
      try {
        const response = await fetch(`/api/places/${placeId}/following-users`);
        if (!response.ok) throw new Error('Failed to fetch following users');
        
        const data = await response.json();
        setFollowingUsers(data.users);
        setShowFollowingUsers(true);
      } catch (error) {
        console.error('Error fetching following users:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setShowFollowingUsers(false);
    }
  };

  const handleUserClick = (userId: string) => {
    router.push(`/userprofile/${userId}`);
    setShowFollowingUsers(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Statistiques</h2>
        <button
          onClick={onSponsor}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <DollarSign size={18} />
          <span>Sponsoriser</span>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye size={18} className="text-gray-500" />
              <span className="font-medium">Vues</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{viewCount}</span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={handleShowFollowingUsers}
              className="flex items-center gap-3 hover:text-primary transition-colors"
            >
              <Bell size={20} className="text-gray-500" />
              <span className="font-medium">Abonnés</span>
            </button>
            <span className="text-2xl font-bold text-gray-900">{followCount}</span>
          </div>
        </div>
      </div>

      {showFollowingUsers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold">Personnes abonnées</h3>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {followingUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                      <button
                        onClick={() => handleUserClick(user.id)}
                        className="font-medium hover:text-primary transition-colors text-left"
                      >
                        {user.name}
                      </button>
                      <span className="text-sm text-gray-500">
                        {format(new Date(user.followedAt), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowFollowingUsers(false)}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}