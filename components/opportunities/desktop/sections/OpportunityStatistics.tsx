'use client';

import { Eye, Heart } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface InterestedUser {
  id: string;
  name: string;
  interestedAt: string;
}

interface OpportunityStatisticsProps {
  opportunityId: string;
  viewCount: number;
  interestCount: number;
}

export default function OpportunityStatistics({
  opportunityId,
  viewCount,
  interestCount
}: OpportunityStatisticsProps) {
  const [showInterestedUsers, setShowInterestedUsers] = useState(false);
  const [interestedUsers, setInterestedUsers] = useState<InterestedUser[]>([]);
  const [loading, setLoading] = useState(false);

  const handleShowInterestedUsers = async () => {
    if (!showInterestedUsers) {
      setLoading(true);
      try {
        const response = await fetch(`/api/opportunities/${opportunityId}/interested-users`);
        if (!response.ok) throw new Error('Failed to fetch interested users');
        
        const data = await response.json();
        setInterestedUsers(data.users);
        setShowInterestedUsers(true);
      } catch (error) {
        console.error('Error fetching interested users:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setShowInterestedUsers(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Statistiques</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye size={20} className="text-gray-500" />
              <span className="font-medium">Vues</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{viewCount}</span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={handleShowInterestedUsers}
              className="flex items-center gap-3 hover:text-primary transition-colors"
            >
              <Heart size={20} className="text-gray-500" />
              <span className="font-medium">Intéressés</span>
            </button>
            <span className="text-2xl font-bold text-gray-900">{interestCount}</span>
          </div>
        </div>
      </div>

      {showInterestedUsers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold">Personnes intéressées</h3>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {interestedUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(user.interestedAt), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowInterestedUsers(false)}
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