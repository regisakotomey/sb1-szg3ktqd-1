'use client';

import { ChevronLeft, Share2, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import ShopHeader from './sections/ShopHeader';
import ShopActions from './sections/ShopActions';
import ShopStatistics from './sections/ShopStatistics';
import ShopOrganizer from './sections/ShopOrganizer';
import ShopDetails from './sections/ShopDetails';
import ShopComments from './sections/ShopComments';
import ShopBottomBar from './sections/ShopBottomBar';
import ShopMenu from './sections/ShopMenu';
import ShopAdSpots from './sections/ShopAdSpots';
import ShopProducts from './sections/ShopProducts';
import { Shop } from '@/types/shop';
import { getUserData } from '@/lib/storage';

interface MobileShopViewProps {
  shop: Shop;
  isOwner: boolean;
  isShopFollowing: boolean;
  isOrganizerFollowing: boolean;
  activeTab: 'products' | 'details' | 'comments';
  onTabChange: (tab: 'products' | 'details' | 'comments') => void;
  onBack: () => void;
  onShare: () => void;
  onSponsor: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onToggleFollow: (newState: boolean) => void;
  onToggleOrganizerFollow: (newState: boolean) => void;
}

export default function MobileShopView({
  shop,
  isOwner,
  isShopFollowing,
  isOrganizerFollowing,
  activeTab,
  onTabChange,
  onBack,
  onShare,
  onSponsor,
  onEdit,
  onDelete,
  onReport,
  onToggleFollow,
  onToggleOrganizerFollow
}: MobileShopViewProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [currentShop, setCurrentShop] = useState(shop);

  const handleEditComplete = async () => {
    // Recharger les données de la boutique
    try {
      const userData = getUserData();
      const response = await fetch(`/api/shops/get?id=${shop._id}&currentUserId=${userData?.id || ''}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la boutique');
      }
      const updatedShop = await response.json();
      setCurrentShop(updatedShop);
    } catch (error) {
      console.error('Error refreshing shop data:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return (
          <div className="p-4">
            <ShopProducts shopId={currentShop._id} isOwner={isOwner} />
          </div>
        );
      case 'details':
        return (
          <div className="px-4 py-2 space-y-4">
            {isOwner ? (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Statistiques</h3>
                <ShopStatistics
                  shopId={currentShop._id}
                  viewCount={currentShop.views?.length || 0}
                  followCount={currentShop.followers?.length || 0}
                />
              </div>
            ) : currentShop.organizer && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Publié par</h3>
                <ShopOrganizer
                  organizer={currentShop.organizer}
                  isOwner={isOwner}
                  isFollowing={isOrganizerFollowing}
                  onFollow={() => onToggleOrganizerFollow(!isOrganizerFollowing)}
                />
              </div>
            )}
            <ShopDetails shop={currentShop} />
          </div>
        );
      case 'comments':
        return (
          <div className="p-4">
            <ShopComments shopId={currentShop._id} />
          </div>
        );
      default:
        return null;
    }
  };

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
          {currentShop.name}
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
        <ShopHeader shop={currentShop} />

        <ShopAdSpots shopId={currentShop._id} />

        {/* Navigation Tabs */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-40">
          <div className="flex">
            <button
              onClick={() => onTabChange('products')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'products'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Articles
            </button>
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
        {renderTabContent()}

        {/* Add bottom padding to account for the fixed bottom bar */}
        <div className="h-20"></div>
      </div>

      {/* Fixed Bottom Bar */}
      <ShopBottomBar
        shopId={currentShop._id}
        isOwner={isOwner}
        isFollowing={isShopFollowing}
        onToggleFollow={onToggleFollow}
      />

      {/* Menu */}
      <ShopMenu
        isOpen={showMenu}
        isOwner={isOwner}
        shopId={currentShop._id}
        shop={currentShop}
        onClose={() => setShowMenu(false)}
        onShare={onShare}
        onEdit={onEdit}
        onDelete={onDelete}
        onReport={onReport}
        onEditComplete={handleEditComplete}
      />
    </main>
  );
}