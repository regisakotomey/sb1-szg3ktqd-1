'use client';

import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Place } from '@/types/place';

interface PlaceDetailsProps {
  place: Place;
}

export default function PlaceDetails({ place }: PlaceDetailsProps) {
  return (
    <div >
      {/* Description */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">À propos</h3>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">
          {place.longDescription ? place.longDescription : place.shortDescription}
        </p>
      </div>

      {/* Localisation */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Lieu</h3>
        <div className="flex items-start gap-2 text-sm">
          <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
          <span>{place.locationDetails}</span>
        </div>
      </div>

      {/* Contact */}
      {(place.contact.phone || place.contact.email || place.contact.website) && (
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Contact</h3>
          <div className="space-y-2">
            {place.contact.phone && (
              <a 
                href={`tel:${place.contact.phone}`}
                className="flex items-center gap-2 text-sm text-primary"
              >
                <Phone size={16} className="text-gray-500" />
                <span>{place.contact.phone}</span>
              </a>
            )}
            {place.contact.email && (
              <a 
                href={`mailto:${place.contact.email}`}
                className="flex items-center gap-2 text-sm text-primary"
              >
                <Mail size={16} className="text-gray-500" />
                <span>{place.contact.email}</span>
              </a>
            )}
            {place.contact.website && (
              <a 
                href={place.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary"
              >
                <Globe size={16} className="text-gray-500" />
                <span>{place.contact.website}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}