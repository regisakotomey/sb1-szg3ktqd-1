'use client';

import { useEffect } from 'react';
import { Briefcase, MapPin } from 'lucide-react';
import { Opportunity } from '@/types/opportunity';
import { getOpportunityTypeLabel } from '@/lib/opportunity-types';
import { getUserData } from '@/lib/storage';

interface DesktopOpportunitiesListProps {
  opportunities: Opportunity[];
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
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"
    >
      <div className="aspect-video relative">
        <img
          src={opportunity.mainImage}
          alt={opportunity.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {getOpportunityTypeLabel(opportunity.type)}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {opportunity.title}
        </h3>

        <div className="flex items-center gap-2">
          <MapPin size={14} />
          <span className="line-clamp-1">{opportunity.locationDetails}</span>
        </div>
      </div>
    </div>
  );
}

export default function DesktopOpportunitiesList({
  opportunities,
  onOpportunityClick,
  lastOpportunityRef,
}: DesktopOpportunitiesListProps) {
  return (
    <main className="flex-1 pt-[60px] mx-auto w-full max-w-[550px] transition-all">
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-6">Opportunités disponibles</h1>

        {opportunities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune opportunité disponible pour le moment
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {opportunities.map((opportunity, index) => (
              <OpportunityCard
                key={opportunity._id}
                opportunity={opportunity}
                onOpportunityClick={onOpportunityClick}
                lastOpportunityRef={index === opportunities.length - 1 ? lastOpportunityRef : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}