'use client';

import { ChevronLeft, Share2, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import EventHeader from './sections/EventHeader';
import EventActions from './sections/EventActions';
import EventStatistics from './sections/EventStatistics';
import EventOrganizer from './sections/EventOrganizer';
import EventDetails from './sections/EventDetails';
import EventComments from './sections/EventComments';
import EventBottomBar from './sections/EventBottomBar';
import EventMenu from './sections/EventMenu';
import EventGallery from './sections/EventGallery';
import { Event } from '@/types/event';
import { getUserData } from '@/lib/storage';

interface MobileEventViewProps {
  event: Event;
  isOwner: boolean;
  isEventInterested: boolean;
  isOrganizerFollowing: boolean;
  activeTab: 'details' | 'comments';
  onTabChange: (tab: 'details' | 'comments') => void;
  onBack: () => void;
  onShare: () => void;
  onSponsor: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onToggleInterest: (newState: boolean) => void;
  onToggleFollow: (newState: boolean) => void;
}

export default function MobileEventView({
  event,
  isOwner,
  isEventInterested,
  isOrganizerFollowing,
  activeTab,
  onTabChange,
  onBack,
  onShare,
  onSponsor,
  onEdit,
  onDelete,
  onReport,
  onToggleInterest,
  onToggleFollow
}: MobileEventViewProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(event);

  const handleEditComplete = async () => {
    // Recharger les données de l'événement
    try {
      const userData = getUserData();
      const response = await fetch(`/api/events/get?id=${event._id}&currentUserId=${userData?.id || ''}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'événement');
      }
      const updatedEvent = await response.json();
      setCurrentEvent(updatedEvent);
    } catch (error) {
      console.error('Error refreshing event data:', error);
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
          {currentEvent.title}
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
        <EventHeader event={currentEvent} />

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
          <div>
            {isOwner ? (
              <div className="bg-white rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3">Statistiques</h3>
              <EventStatistics
                eventId={currentEvent._id}
                viewCount={currentEvent.views?.length || 0}
                interestCount={currentEvent.interests?.length || 0}
              />
              </div>
            ) : currentEvent.organizer && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Publié par</h3>
                <EventOrganizer
                  organizer={currentEvent.organizer}
                  isOwner={isOwner}
                  isFollowing={isOrganizerFollowing}
                  onFollow={() => onToggleFollow(!isOrganizerFollowing)}
                />
              </div>
            )}

            <EventDetails event={currentEvent} />

            {currentEvent.additionalMedia && currentEvent.additionalMedia.length > 0 && (
              <EventGallery images={currentEvent.additionalMedia} />
            )}
          </div>
        ) : (
          <div className="p-4">
            <EventComments eventId={currentEvent._id} />
          </div>
        )}

        {/* Add bottom padding to account for the fixed bottom bar */}
        <div className="h-20"></div>
      </div>

      {/* Fixed Bottom Bar */}
      <EventBottomBar
        eventId={currentEvent._id}
        isOwner={isOwner}
        isInterested={isEventInterested}
        onToggleInterest={onToggleInterest}
      />

      {/* Menu */}
      <EventMenu
        isOpen={showMenu}
        isOwner={isOwner}
        event={currentEvent}
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