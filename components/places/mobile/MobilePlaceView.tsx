'use client';

import { ChevronLeft, Share2, MoreVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import PlaceHeader from './sections/PlaceHeader';
import PlaceActions from './sections/PlaceActions';
import PlaceStatistics from './sections/PlaceStatistics';
import PlaceOrganizer from './sections/PlaceOrganizer';
import PlaceDetails from './sections/PlaceDetails';
import PlaceComments from './sections/PlaceComments';
import PlaceBottomBar from './sections/PlaceBottomBar';
import PlaceAddedContentButtons from './sections/PlaceAddedContentButtons';
import PlaceMenu from './sections/PlaceMenu';
import PlaceGallery from './sections/PlaceGallery';
import PlaceAdSpots from './sections/PlaceAdSpots';
import { Place } from '@/types/place';
import { getUserData } from '@/lib/storage';

interface MobilePlaceViewProps {
  place: Place;
  isOwner: boolean;
  isPlaceFollowing: boolean;
  isOrganizerFollowing: boolean;
  activeTab: 'details' | 'comments';
  onTabChange: (tab: 'details' | 'comments') => void;
  onBack: () => void;
  onShare: () => void;
  onSponsor: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onToggleFollow: (newState: boolean) => void;
  onToggleOrganizerFollow: (newState: boolean) => void;
}

export default function MobilePlaceView({
  place,
  isOwner,
  isPlaceFollowing,
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
}: MobilePlaceViewProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [currentPlace, setCurrentPlace] = useState(place);

  const handleEditComplete = async () => {
    // Recharger les données du lieu
    try {
      const userData = getUserData();
      const response = await fetch(`/api/places/get?id=${place._id}&currentUserId=${userData?.id || ''}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du lieu');
      }
      const updatedPlace = await response.json();
      setCurrentPlace(updatedPlace);
    } catch (error) {
      console.error('Error refreshing place data:', error);
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
          {currentPlace.name}
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
        <PlaceHeader place={currentPlace} />

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
          <div className="space-y-4">
            {isOwner ? (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Statistiques</h3>
                <PlaceStatistics
                  placeId={currentPlace._id}
                  viewCount={currentPlace.views?.length || 0}
                  followCount={currentPlace.followers?.length || 0}
                />
              </div>
            ) : currentPlace.organizer && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Publié par</h3>
                <PlaceOrganizer
                  organizer={currentPlace.organizer}
                  isOwner={isOwner}
                  isFollowing={isOrganizerFollowing}
                  onFollow={() => onToggleOrganizerFollow(!isOrganizerFollowing)}
                />
              </div>
            )}

              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-semibold">Ajouté par ce lieu :</h3>
                <PlaceAddedContentButtons placeId={place._id} />
              </div>
            
            <PlaceAdSpots placeId={currentPlace._id} />
            <PlaceDetails place={currentPlace} />
            {place.additionalImages && place.additionalImages.length > 0 && (
                <PlaceGallery images={place.additionalImages} />
              )}
          </div>
        ) : (
          <div className="p-4">
            <PlaceComments placeId={currentPlace._id} />
          </div>
        )}

        {/* Add bottom padding to account for the fixed bottom bar */}
        <div className="h-20"></div>
      </div>

      {/* Fixed Bottom Bar */}
      <PlaceBottomBar
        placeId={currentPlace._id}
        isOwner={isOwner}
        isFollowing={isPlaceFollowing}
        onToggleFollow={onToggleFollow}
      />

      {/* Menu */}
      <PlaceMenu
        isOpen={showMenu}
        isOwner={isOwner}
        placeId={currentPlace._id}
        place={currentPlace}
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