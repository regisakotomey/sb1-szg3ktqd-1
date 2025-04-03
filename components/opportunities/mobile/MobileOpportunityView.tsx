'use client';

import { ChevronLeft, Share2, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import OpportunityHeader from './sections/OpportunityHeader';
import OpportunityActions from './sections/OpportunityActions';
import OpportunityStatistics from './sections/OpportunityStatistics';
import OpportunityOrganizer from './sections/OpportunityOrganizer';
import OpportunityDetails from './sections/OpportunityDetails';
import OpportunityComments from './sections/OpportunityComments';
import OpportunityBottomBar from './sections/OpportunityBottomBar';
import OpportunityMenu from './sections/OpportunityMenu';
import OpportunityGallery from './sections/OpportunityGallery';
import { Opportunity } from '@/types/opportunity';
import { getUserData } from '@/lib/storage';

interface MobileOpportunityViewProps {
  opportunity: Opportunity;
  isOwner: boolean;
  isOpportunityInterested: boolean;
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

export default function MobileOpportunityView({
  opportunity,
  isOwner,
  isOpportunityInterested,
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
}: MobileOpportunityViewProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [currentOpportunity, setCurrentOpportunity] = useState(opportunity);

  const handleEditComplete = async () => {
    // Recharger les données de l'opportunité
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
          {currentOpportunity.title}
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
        <OpportunityHeader opportunity={currentOpportunity} />

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
                <OpportunityStatistics
                  opportunityId={currentOpportunity._id}
                  viewCount={currentOpportunity.views?.length || 0}
                  interestCount={currentOpportunity.interests?.length || 0}
                />
              </div>
            ) : currentOpportunity.organizer && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Publié par</h3>
                <OpportunityOrganizer
                  organizer={currentOpportunity.organizer}
                  isOwner={isOwner}
                  isFollowing={isOrganizerFollowing}
                  onFollow={() => onToggleFollow(!isOrganizerFollowing)}
                />
              </div>
            )}

            <OpportunityDetails opportunity={currentOpportunity} />

            {currentOpportunity.additionalImages && currentOpportunity.additionalImages.length > 0 && (
              <OpportunityGallery images={currentOpportunity.additionalImages} />
            )}
          </div>
        ) : (
          <div className="p-4">
            <OpportunityComments opportunityId={currentOpportunity._id} />
          </div>
        )}

        {/* Add bottom padding to account for the fixed bottom bar */}
        <div className="h-20"></div>
      </div>

      {/* Fixed Bottom Bar */}
      <OpportunityBottomBar
        opportunityId={currentOpportunity._id}
        isOwner={isOwner}
        isInterested={isOpportunityInterested}
        onToggleInterest={onToggleInterest}
      />

      {/* Menu */}
      <OpportunityMenu
        isOpen={showMenu}
        isOwner={isOwner}
        opportunity={currentOpportunity}
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