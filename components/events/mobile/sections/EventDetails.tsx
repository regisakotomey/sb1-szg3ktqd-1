'use client';

import { MapPin, Phone, Mail, Globe, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Event } from '@/types/event';

interface EventDetailsProps {
  event: Event;
}

export default function EventDetails({ event }: EventDetailsProps) {
  return (
    <div className="space-y-4">
      {/* Description */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">À propos</h3>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">
          {event.description}
        </p>
      </div>

      {/* Date et heure */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Date et heure</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-gray-500" />
            <span>
              {format(new Date(event.startDate), 'dd MMMM yyyy', { locale: fr })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-gray-500" />
            <span>
              {format(new Date(event.startDate), 'HH:mm', { locale: fr })} - 
              {format(new Date(event.endDate), 'HH:mm', { locale: fr })}
            </span>
          </div>
        </div>
      </div>

      {/* Localisation */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Lieu</h3>
        <div className="flex items-start gap-2 text-sm">
          <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
          <span>{event.address}</span>
        </div>
      </div>

      {/* Contact */}
      {(event.contact.phone || event.contact.email || event.contact.website) && (
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Contact</h3>
          <div className="space-y-2">
            {event.contact.phone && (
              <a 
                href={`tel:${event.contact.phone}`}
                className="flex items-center gap-2 text-sm text-primary"
              >
                <Phone size={16} className="text-gray-500" />
                <span>{event.contact.phone}</span>
              </a>
            )}
            {event.contact.email && (
              <a 
                href={`mailto:${event.contact.email}`}
                className="flex items-center gap-2 text-sm text-primary"
              >
                <Mail size={16} className="text-gray-500" />
                <span>{event.contact.email}</span>
              </a>
            )}
            {event.contact.website && (
              <a 
                href={event.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary"
              >
                <Globe size={16} className="text-gray-500" />
                <span>{event.contact.website}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}