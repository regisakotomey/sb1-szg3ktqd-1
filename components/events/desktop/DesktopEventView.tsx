'use client';

import { Event } from '@/types/event';
import EventHeader from './sections/EventHeader';
import EventActions from './sections/EventActions';
import EventStatistics from './sections/EventStatistics';
import EventOrganizer from './sections/EventOrganizer';
import EventDetails from './sections/EventDetails';
import EventGallery from './sections/EventGallery';
import EventComments from './sections/EventComments';
import { useState, useEffect } from 'react';
import EditEventForm from '@/components/forms/EditEventForm';
import { getUserData } from '@/lib/storage';

interface DesktopEventViewProps {
  event: Event;
  isOwner: boolean;
  isEventInterested: boolean;
  isOrganizerFollowing: boolean;
  onShare: () => void;
  onSponsor: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onToggleInterest: (newState: boolean) => void;
  onToggleFollow: (newState: boolean) => void;
}

export default function DesktopEventView({
  event,
  isOwner,
  isEventInterested,
  isOrganizerFollowing,
  onShare,
  onSponsor,
  onEdit,
  onDelete,
  onReport,
  onToggleInterest,
  onToggleFollow
}: DesktopEventViewProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(event);
  const [isFollowing, setIsFollowing] = useState(isOrganizerFollowing);

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleEditComplete = async () => {
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
    setShowEditForm(false);
  };

  const handleFollow = async (newState: boolean) => {
    setIsFollowing(newState);
    onToggleFollow(newState);
  };

  return (
    <>
      <main className="flex-1 pt-[76px] transition-all">
        {/* Hero Section */}
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <EventHeader
            title={currentEvent.title}
            startDate={currentEvent.startDate}
            mainMedia={currentEvent.mainMedia}
            type={currentEvent.type}
          />
        </div>

        {/* Main Content */}
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Main Content */}
            <div className="col-span-12 lg:col-span-8">
              <EventActions
                eventId={currentEvent._id}
                isOwner={isOwner}
                isInterested={isEventInterested}
                onSponsor={onSponsor}
                onEdit={handleEdit}
                onDelete={onDelete}
                onReport={onReport}
                onShare={onShare}
                onToggleInterest={onToggleInterest}
              />

              <EventDetails
                description={currentEvent.description}
                address={currentEvent.address}
                contact={currentEvent.contact}
              />

              {currentEvent.additionalMedia && currentEvent.additionalMedia.length > 0 && (
                <EventGallery images={currentEvent.additionalMedia} />
              )}

              <EventComments eventId={currentEvent._id} />
            </div>

            {/* Right Column - Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {isOwner ? (
                <EventStatistics
                  eventId={currentEvent._id}
                  viewCount={currentEvent.views?.length || 0}
                  interestCount={currentEvent.interests?.length || 0}
                  onSponsor={onSponsor}
                />
              ) : currentEvent.organizer && (
                <EventOrganizer
                  organizer={currentEvent.organizer}
                  isOwner={isOwner}
                  isFollowing={isFollowing}
                  onFollow={() => handleFollow(!isFollowing)}
                />
              )}

              {/* Additional Sidebar Content */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Informations pratiques</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Date et heure</h4>
                    <p className="text-gray-600">
                      Du {new Date(currentEvent.startDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-gray-600">
                      Au {new Date(currentEvent.endDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Localisation</h4>
                    <p className="text-gray-600">{currentEvent.address}</p>
                  </div>

                  {(currentEvent.contact.phone || currentEvent.contact.email || currentEvent.contact.website) && (
                    <div>
                      <h4 className="font-medium mb-2">Contact</h4>
                      {currentEvent.contact.phone && (
                        <p className="text-gray-600 mb-1">
                          Tél: {currentEvent.contact.phone}
                        </p>
                      )}
                      {currentEvent.contact.email && (
                        <p className="text-gray-600 mb-1">
                          Email: {currentEvent.contact.email}
                        </p>
                      )}
                      {currentEvent.contact.website && (
                        <p className="text-gray-600">
                          Site web: {currentEvent.contact.website}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showEditForm && (
        <EditEventForm 
          event={currentEvent}
          onClose={handleEditComplete}
        />
      )}
    </>
  );
}