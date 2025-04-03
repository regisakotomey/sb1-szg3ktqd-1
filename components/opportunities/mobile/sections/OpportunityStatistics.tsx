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
    <>
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Statistiques</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-gray-500" />
                <span className="text-sm">Vues</span>
              </div>
              <span className="text-lg font-semibold">{viewCount}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <button
                onClick={handleShowInterestedUsers}
                className="flex items-center gap-2"
              >
                <Heart size={16} className="text-gray-500" />
                <span className="text-sm">Intéressés</span>
              </button>
              <span className="text-lg font-semibold">{interestCount}</span>
            </div>
          </div>
        </div>
      </div>

      {showInterestedUsers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Personnes intéressées</h3>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {interestedUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-gray-500">
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
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}