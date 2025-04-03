'use client';

import { useEffect } from 'react';
import { Briefcase, MapPin } from 'lucide-react';
import { Opportunity } from '@/types/opportunity';
import { getOpportunityTypeLabel } from '@/lib/opportunity-types';
import { getUserData } from '@/lib/storage';

interface MobileOpportunitiesListProps {
  opportunities: Opportunity[];
  hasMore: boolean;
  onOpportunityClick: (id: string) => void;
  lastOpportunityRef?: (node: HTMLDivElement) => void;
}

function OpportunityCard({
  opportunity,
  onOpportunityClick,
  lastOpportunityRef,
}: {
  opportunity: Opportunity;
  onOpportunityClick: (id: string) => void;
  lastOpportunityRef?: (node: HTMLDivElement) => void;
}) {
  useEffect(() => {
    const recordView = async () => {
      const userData = getUserData();
      if (!userData?.id) return;

      try {
        await fetch(`/api/opportunities/${opportunity._id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.id }),
        });
      } catch (error) {
        console.error('Error recording view:', error);
      }
    };

    recordView();
  }, [opportunity._id]);

  return (
    <div
      ref={lastOpportunityRef}
      onClick={() => onOpportunityClick(opportunity._id)}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="aspect-[16/9] relative">
        <img
          src={opportunity.mainImage}
          alt={opportunity.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {getOpportunityTypeLabel(opportunity.type)}
        </div>
      </div>

      <div className="p-2">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {opportunity.title}
        </h3>

        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
          {opportunity.description}
        </p>
      </div>
    </div>
  );
}

export default function MobileOpportunitiesList({
  opportunities,
  hasMore,
  onOpportunityClick,
  lastOpportunityRef,
}: MobileOpportunitiesListProps) {
  return (
    <div className="h-screen overflow-y-auto">
      <main className="flex-1 pt-[60px] pb-[60px] mx-auto w-full max-w-[550px]">
        <h1 className="text-xl font-semibold p-3">Opportunités disponibles</h1>

        {opportunities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune opportunité disponible pour le moment
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {opportunities.map((opportunity, index) => (
              <OpportunityCard
                key={opportunity._id}
                opportunity={opportunity}
                onOpportunityClick={onOpportunityClick}
                lastOpportunityRef={index === opportunities.length - 1 ? lastOpportunityRef : undefined}
              />
            ))}
            {lastOpportunityRef && hasMore &&(
              <div className="p-4">
                <div className={`grid grid-cols-1 gap-4`}>
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                      <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}