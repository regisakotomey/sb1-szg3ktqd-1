'use client';

import { useState } from 'react';
import ShopHeader from './sections/ShopHeader';
import ShopActions from './sections/ShopActions';
import ShopStatistics from './sections/ShopStatistics';
import ShopOrganizer from './sections/ShopOrganizer';
import ShopDetails from './sections/ShopDetails';
import ShopComments from './sections/ShopComments';
import ShopCreationButtons from './sections/ShopCreationButtons';
import ShopAdSpots from './sections/ShopAdSpots';
import ShopProducts from './sections/ShopProducts';
import EditShopForm from '@/components/forms/EditShopForm';
import { getUserData } from '@/lib/storage';
import { Shop } from '@/types/shop';

interface DesktopShopViewProps {
  shop: Shop;
  isOwner: boolean;
  isShopFollowing: boolean;
  isOrganizerFollowing: boolean;
  onShare: () => void;
  onSponsor: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onToggleFollow: (newState: boolean) => void;
  onToggleOrganizerFollow: (newState: boolean) => void;
}

export default function DesktopShopView({
  shop,
  isOwner,
  isShopFollowing,
  isOrganizerFollowing,
  onShare,
  onSponsor,
  onEdit,
  onDelete,
  onReport,
  onToggleFollow,
  onToggleOrganizerFollow
}: DesktopShopViewProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentShop, setCurrentShop] = useState(shop);

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleEditComplete = async () => {
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
    setShowEditForm(false);
  };

  return (
    <>
      <main className="flex-1 pt-[76px] transition-all">
        {/* Hero Section */}
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <ShopHeader
            name={currentShop.name}
            logo={currentShop.logo}
          />
        </div>

        {/* Main Content */}
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-12 gap-6">
            {/* Right Column - Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {isOwner ? (
                <>
                  <ShopStatistics
                    shopId={currentShop._id}
                    viewCount={currentShop.views?.length || 0}
                    followCount={currentShop.followers?.length || 0}
                    onSponsor={onSponsor}
                  />
                  <ShopCreationButtons
                    shopId={currentShop._id}
                  />
                </>
              ) : currentShop.organizer && (
                <ShopOrganizer
                  organizer={currentShop.organizer}
                  isOwner={isOwner}
                  isFollowing={isOrganizerFollowing}
                  onFollow={() => onToggleOrganizerFollow(!isOrganizerFollowing)}
                />
              )}

              <ShopDetails
                description={currentShop.description}
                countries={currentShop.countries}
                contact={currentShop.contact}
              />

              <ShopComments shopId={currentShop._id} />
            </div>

            {/* Left Column - Main Content */}
            <div className="col-span-12 lg:col-span-8">
              <ShopActions
                shopId={currentShop._id}
                isOwner={isOwner}
                isFollowing={isShopFollowing}
                onSponsor={onSponsor}
                onEdit={handleEdit}
                onDelete={onDelete}
                onReport={onReport}
                onShare={onShare}
                onToggleFollow={onToggleFollow}
              />

              <ShopAdSpots 
                shopId={currentShop._id}
                isOwner={isOwner}
              />

              <ShopProducts
                shopId={currentShop._id}
                isOwner={isOwner}
              />
            </div>
          </div>
        </div>
      </main>

      {showEditForm && (
        <EditShopForm 
          shop={currentShop}
          onClose={handleEditComplete}
        />
      )}
    </>
  );
}