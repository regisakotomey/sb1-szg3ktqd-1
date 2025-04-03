'use client';

import { ChevronLeft, Share2, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import AdSpotHeader from './sections/AdSpotHeader';
import AdSpotActions from './sections/AdSpotActions';
import AdSpotStatistics from './sections/AdSpotStatistics';
import AdSpotCreator from './sections/AdSpotCreator';
import AdSpotComments from './sections/AdSpotComments';
import AdSpotBottomBar from './sections/AdSpotBottomBar';
import AdSpotMenu from './sections/AdSpotMenu';

interface AdSpot {
  _id: string;
  media: Array<{
    url: string;
    caption: string;
  }>;
  creator?: {
    id: string;
    name: string;
    followers: number;
    isFollowed: boolean;
    type: 'user' | 'place';
  };
  views: Array<{ userId: string; viewedAt: string }>;
}

interface MobileAdSpotViewProps {
  adSpot: AdSpot;
  isOwner: boolean;
  isCreatorFollowing: boolean;
  activeTab: 'details' | 'comments';
  onTabChange: (tab: 'details' | 'comments') => void;
  onBack: () => void;
  onShare: () => void;
  onSponsor: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onToggleFollow: (newState: boolean) => void;
}

export default function MobileAdSpotView({
  adSpot,
  isOwner,
  isCreatorFollowing,
  activeTab,
  onTabChange,
  onBack,
  onShare,
  onSponsor,
  onEdit,
  onDelete,
  onReport,
  onToggleFollow
}: MobileAdSpotViewProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <main className="flex-1 flex flex-col h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="flex items-center h-14 px-4">
        <button 
          onClick={onBack}
          className="hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="flex-1 text-lg font-semibold truncate ml-2">
          Spot publicitaire
        </h1>
        <button
          onClick={() => setShowMenu(true)}
          className="p-2 -mr-2 hover:bg-gray-100 rounded-full"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Image and Content */}
        <AdSpotHeader adSpot={adSpot} />

        {/* Navigation Tabs */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-40">
          <div className="flex">
            <button
              onClick={() => onTabChange('details')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'details'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Détails
            </button>
            <button
              onClick={() => onTabChange('comments')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'comments'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Commentaires
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' ? (
          <div className="p-4 space-y-4">
            {isOwner ? (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Statistiques</h3>
                <AdSpotStatistics
                  viewCount={adSpot.views?.length || 0}
                />
              </div>
            ) : adSpot.creator && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Publié par</h3>
                <AdSpotCreator
                  creator={adSpot.creator}
                  isOwner={isOwner}
                  isFollowing={isCreatorFollowing}
                  onFollow={() => onToggleFollow(!isCreatorFollowing)}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <AdSpotComments adSpotId={adSpot._id} />
          </div>
        )}

        {/* Add bottom padding to account for the fixed bottom bar */}
        <div className="h-20"></div>
      </div>

      {/* Fixed Bottom Bar */}
      <AdSpotBottomBar
        adSpotId={adSpot._id}
        isOwner={isOwner}
      />

      {/* Menu */}
      <AdSpotMenu
        isOpen={showMenu}
        isOwner={isOwner}
        onClose={() => setShowMenu(false)}
        onShare={onShare}
        onEdit={onEdit}
        onDelete={onDelete}
        onReport={onReport}
      />
    </main>
  );
}