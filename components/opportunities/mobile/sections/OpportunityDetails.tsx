'use client';

import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Opportunity } from '@/types/opportunity';

interface OpportunityDetailsProps {
  opportunity: Opportunity;
}

export default function OpportunityDetails({ opportunity }: OpportunityDetailsProps) {
  return (
    <div className="space-y-4">
      {/* Description */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Description</h3>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">
          {opportunity.description}
        </p>
      </div>

      {/* Localisation */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Lieu</h3>
        <div className="flex items-start gap-2 text-sm">
          <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
          <span>{opportunity.locationDetails}</span>
        </div>
      </div>

      {/* Contact */}
      {(opportunity.contact.phone || opportunity.contact.email || opportunity.contact.website) && (
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Contact</h3>
          <div className="space-y-2">
            {opportunity.contact.phone && (
              <a 
                href={`tel:${opportunity.contact.phone}`}
                className="flex items-center gap-2 text-sm text-primary"
              >
                <Phone size={16} className="text-gray-500" />
                <span>{opportunity.contact.phone}</span>
              </a>
            )}
            {opportunity.contact.email && (
              <a 
                href={`mailto:${opportunity.contact.email}`}
                className="flex items-center gap-2 text-sm text-primary"
              >
                <Mail size={16} className="text-gray-500" />
                <span>{opportunity.contact.email}</span>
              </a>
            )}
            {opportunity.contact.website && (
              <a 
                href={opportunity.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary"
              >
                <Globe size={16} className="text-gray-500" />
                <span>{opportunity.contact.website}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}