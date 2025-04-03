'use client';

import { MapPin, Phone, Mail, Globe, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventDetailsProps {
  description: string;
  address: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export default function EventDetails({
  description,
  address,
  contact
}: EventDetailsProps) {
  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Description</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date et heure */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={20} className="text-gray-500" />
            <span className="font-medium">Date et heure</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              <span>
                {format(new Date(startDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              <span>
                {format(new Date(endDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </span>
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <MapPin size={20} className="text-gray-500" />
            <span className="font-medium">Lieu</span>
          </div>
          <p>{address}</p>
        </div>

        {/* Contact */}
        {(contact.phone || contact.email || contact.website) && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Phone size={20} className="text-gray-500" />
              <span className="font-medium">Contact</span>
            </div>
            <div className="space-y-2">
              {contact.phone && (
                <a 
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
                >
                  <Phone size={16} className="text-gray-500" />
                  <span>{contact.phone}</span>
                </a>
              )}
              {contact.email && (
                <a 
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
                >
                  <Mail size={16} className="text-gray-500" />
                  <span>{contact.email}</span>
                </a>
              )}
              {contact.website && (
                <a 
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
                >
                  <Globe size={16} className="text-gray-500" />
                  <span>{contact.website}</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}