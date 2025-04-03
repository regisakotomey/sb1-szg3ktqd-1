'use client';

import OpportunityHeader from './sections/OpportunityHeader';
import OpportunityActions from './sections/OpportunityActions';
import OpportunityStatistics from './sections/OpportunityStatistics';
import OpportunityOrganizer from './sections/OpportunityOrganizer';
import OpportunityDetails from './sections/OpportunityDetails';
import OpportunityGallery from './sections/OpportunityGallery';
import OpportunityComments from './sections/OpportunityComments';
import { useState, useEffect } from 'react';
import EditOpportunityForm from '@/components/forms/EditOpportunityForm';
import { getUserData } from '@/lib/storage';
import { Opportunity } from '@/types/opportunity';

interface DesktopOpportunityViewProps {
  opportunity: Opportunity;
  isOwner: boolean;
  isOpportunityInterested: boolean;
  isOrganizerFollowing: boolean;
  onShare: () => void;
  onSponsor: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onToggleInterest: (newState: boolean) => void;
  onToggleFollow: (newState: boolean) => void;
}

export default function DesktopOpportunityView({
  opportunity,
  isOwner,
  isOpportunityInterested,
  isOrganizerFollowing,
  onShare,
  onSponsor,
  onEdit,
  onDelete,
  onReport,
  onToggleInterest,
  onToggleFollow
}: DesktopOpportunityViewProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentOpportunity, setCurrentOpportunity] = useState(opportunity);

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleEditComplete = async () => {
    try {
      const userData = getUserData();
      const response = await fetch(`/api/opportunities/get?id=${opportunity._id}&currentUserId=${userData?.id || ''}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'opportunité');
      }
      const updatedOpportunity = await response.json();
      setCurrentOpportunity(updatedOpportunity);
    } catch (error) {
      console.error('Error refreshing opportunity data:', error);
    }
    setShowEditForm(false);
  };

  return (
    <>
      <main className="flex-1 pt-[76px] transition-all">
        {/* Hero Section */}
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <OpportunityHeader
            title={currentOpportunity.title}
            mainImage={currentOpportunity.mainImage}
            locationDetails={currentOpportunity.locationDetails}
          />
        </div>

        {/* Main Content */}
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Main Content */}
            <div className="col-span-12 lg:col-span-8">
              <OpportunityActions
                opportunityId={currentOpportunity._id}
                isOwner={isOwner}
                isInterested={isOpportunityInterested}
                onSponsor={onSponsor}
                onEdit={handleEdit}
                onDelete={onDelete}
                onReport={onReport}
                onShare={onShare}
                onToggleInterest={onToggleInterest}
              />

              <OpportunityDetails
                description={currentOpportunity.description}
                locationDetails={currentOpportunity.locationDetails}
                contact={currentOpportunity.contact}
              />

              {currentOpportunity.additionalImages && currentOpportunity.additionalImages.length > 0 && (
                <OpportunityGallery images={currentOpportunity.additionalImages} />
              )}

              <OpportunityComments opportunityId={currentOpportunity._id} />
            </div>

            {/* Right Column - Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {isOwner ? (
                <OpportunityStatistics
                  opportunityId={currentOpportunity._id}
                  viewCount={currentOpportunity.views?.length || 0}
                  interestCount={currentOpportunity.interests?.length || 0}
                  onSponsor={onSponsor}
                />
              ) : currentOpportunity.organizer && (
                <OpportunityOrganizer
                  organizer={currentOpportunity.organizer}
                  isOwner={isOwner}
                  isFollowing={isOrganizerFollowing}
                  onFollow={() => onToggleFollow(!isOrganizerFollowing)}
                />
              )}

              {/* Additional Sidebar Content */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Informations pratiques</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Localisation</h4>
                    <p className="text-gray-600">{currentOpportunity.locationDetails}</p>
                  </div>

                  {(currentOpportunity.contact.phone || currentOpportunity.contact.email || currentOpportunity.contact.website) && (
                    <div>
                      <h4 className="font-medium mb-2">Contact</h4>
                      {currentOpportunity.contact.phone && (
                        <p className="text-gray-600 mb-1">
                          Tél: {currentOpportunity.contact.phone}
                        </p>
                      )}
                      {currentOpportunity.contact.email && (
                        <p className="text-gray-600 mb-1">
                          Email: {currentOpportunity.contact.email}
                        </p>
                      )}
                      {currentOpportunity.contact.website && (
                        <p className="text-gray-600">
                          Site web: {currentOpportunity.contact.website}
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
        <EditOpportunityForm 
          opportunity={currentOpportunity}
          onClose={handleEditComplete}
        />
      )}
    </>
  );
}