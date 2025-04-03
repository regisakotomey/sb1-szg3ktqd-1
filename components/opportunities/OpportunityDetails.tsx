'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUserData } from '@/lib/storage';
import MobileOpportunityView from './mobile/MobileOpportunityView';
import DesktopOpportunityView from './desktop/DesktopOpportunityView';
import { Opportunity } from '@/types/opportunity';

export default function OpportunityDetails() {
  const params = useParams();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isOpportunityInterested, setIsOpportunityInterested] = useState(false);
  const [isOrganizerFollowing, setIsOrganizerFollowing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');

  // Check if user is the owner of the place that organized the opportunity
  const checkPlaceOwnership = async (placeId: string, userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/places/${placeId}?currentUserId=${userId}`);
      if (!response.ok) return false;

      const placeData = await response.json();
      return placeData.organizer?.type === 'user' && placeData.organizer?.id === userId;
    } catch (error) {
      console.error('Error checking place ownership:', error);
      return false;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchOpportunityData = async () => {
      try {
        const userData = getUserData();
        const response = await fetch(`/api/opportunities/get?id=${params.id}&currentUserId=${userData?.id || ''}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération de l\'opportunité');
        }
        const opportunityData = await response.json();
        
        setOpportunity(opportunityData);
        
        if (userData) {
          // Check ownership based on both direct ownership and place ownership
          let isOpportunityOwner = false;
          
          if (opportunityData.organizer.type === 'user') {
            // Direct user ownership
            isOpportunityOwner = opportunityData.organizer.id === userData.id;
          } else if (opportunityData.organizer.type === 'place') {
            // Check if user owns the place that created the opportunity
            isOpportunityOwner = await checkPlaceOwnership(opportunityData.organizer.id, userData.id);
          }
          
          setIsOwner(isOpportunityOwner);

          // Check if user is interested in opportunity
          if (opportunityData.interests) {
            const isUserInterested = opportunityData.interests.some(
              (interest: any) => interest.userId === userData.id
            );
            setIsOpportunityInterested(isUserInterested);
          }

          // Check if user is following the organizer
          if (opportunityData.organizer) {
            setIsOrganizerFollowing(opportunityData.organizer.isFollowed);
          }

          // Record view if not owner
          if (!isOpportunityOwner) {
            await fetch(`/api/opportunities/${opportunityData._id}/view`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: userData.id })
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOpportunityData();
    }
  }, [params.id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: opportunity?.title,
        text: opportunity?.description,
        url: window.location.href
      });
    }
  };

  const handleDelete = async () => {
    if (!opportunity) return;

    try {
      const response = await fetch('/api/opportunities/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId: opportunity._id,
          userId: getUserData()?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete opportunity');
      }

      router.push('/content/opportunities');
    } catch (err) {
      console.error('Error:', err);
      setError('Erreur lors de la suppression de l\'opportunité');
    }
  };

  if (loading) {
    return (
      <main className={`flex-1 ${isMobile ? 'pt-0' : 'pt-[76px]'} mx-auto w-full max-w-[800px] transition-all`}>
        <div className="animate-pulse">
          <div className="w-full h-[300px] sm:h-[400px] bg-gray-200"></div>
          <div className="p-4 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !opportunity) {
    return (
      <main className={`flex-1 ${isMobile ? 'pt-0' : 'pt-[76px]'} mx-auto w-full max-w-[800px] transition-all`}>
        <div className="p-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error || 'Opportunité non trouvée'}
          </div>
        </div>
      </main>
    );
  }

  return isMobile ? (
    <MobileOpportunityView
      opportunity={opportunity}
      isOwner={isOwner}
      isOpportunityInterested={isOpportunityInterested}
      isOrganizerFollowing={isOrganizerFollowing}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onBack={() => router.back()}
      onShare={handleShare}
      onSponsor={() => {}}
      onEdit={() => {}}
      onDelete={handleDelete}
      onReport={() => {}}
      onToggleInterest={setIsOpportunityInterested}
      onToggleFollow={setIsOrganizerFollowing}
    />
  ) : (
    <DesktopOpportunityView
      opportunity={opportunity}
      isOwner={isOwner}
      isOpportunityInterested={isOpportunityInterested}
      isOrganizerFollowing={isOrganizerFollowing}
      onShare={handleShare}
      onSponsor={() => {}}
      onEdit={() => {}}
      onDelete={handleDelete}
      onReport={() => {}}
      onToggleInterest={setIsOpportunityInterested}
      onToggleFollow={setIsOrganizerFollowing}
    />
  );
}