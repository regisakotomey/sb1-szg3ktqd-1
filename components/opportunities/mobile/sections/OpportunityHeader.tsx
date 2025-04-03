'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Opportunity } from '@/types/opportunity';
import { getOpportunityTypeLabel } from '@/lib/opportunity-types';

interface OpportunityHeaderProps {
  opportunity: Opportunity;
}

export default function OpportunityHeader({ opportunity }: OpportunityHeaderProps) {
  return (
    <div className="relative">
      <img
        src={opportunity.mainImage}
        alt={opportunity.title}
        className="w-full h-[250px] object-cover"
      />
      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {getOpportunityTypeLabel(opportunity.type)}
      </div>
      <div className="p-4 bg-white">
        <h2 className="text-md font-semibold leading-tight">
          {opportunity.title}
        </h2>
      </div>
    </div>
  );
}