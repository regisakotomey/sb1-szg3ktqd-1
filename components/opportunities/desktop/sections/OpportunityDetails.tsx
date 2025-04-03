'use client';

import { MapPin, Phone, Mail, Globe } from 'lucide-react';

interface OpportunityDetailsProps {
  description: string;
  locationDetails: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export default function OpportunityDetails({
  description,
  locationDetails,
  contact
}: OpportunityDetailsProps) {
  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Description</h2>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <MapPin size={20} className="text-gray-500" />
            <span className="font-medium">Lieu</span>
          </div>
          <p>{locationDetails}</p>
        </div>

        {contact.phone && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Phone size={20} className="text-gray-500" />
              <span className="font-medium">Téléphone</span>
            </div>
            <p>{contact.phone}</p>
          </div>
        )}

        {contact.email && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Mail size={20} className="text-gray-500" />
              <span className="font-medium">Email</span>
            </div>
            <p>{contact.email}</p>
          </div>
        )}

        {contact.website && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Globe size={20} className="text-gray-500" />
              <span className="font-medium">Site web</span>
            </div>
            <p>{contact.website}</p>
          </div>
        )}
      </div>
    </div>
  );
}