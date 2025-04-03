'use client';

import { useState } from 'react';
import { useEventForm } from '@/hooks/useEventForm';
import { getEventTypesByCategory } from '@/lib/event-types';
import MobileFormLayout from './common/MobileFormLayout';
import MobileFormHeader from './common/MobileFormHeader';
import MobileFormError from './common/MobileFormError';
import MobileImageUpload from './common/MobileImageUpload';
import MobileMultipleImageUpload from './common/MobileMultipleImageUpload';
import MobileLocationPicker from './common/MobileLocationPicker';
import MobileFormActions from './common/MobileFormActions';
import { Event } from '@/types/event';

interface EditEventFormProps {
  event: Event;
  onClose: () => void;
}

export default function EditEventForm({ event, onClose }: EditEventFormProps) {
  const { updateEvent, isLoading, error } = useEventForm();
  const [type, setType] = useState(event.type);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [startDate, setStartDate] = useState(event.startDate.slice(0, 16));
  const [endDate, setEndDate] = useState(event.endDate.slice(0, 16));
  const [mainMediaFile, setMainMediaFile] = useState<File | null>(null);
  const [currentMainMedia, setCurrentMainMedia] = useState(event.mainMedia);
  const [additionalMediaFiles, setAdditionalMediaFiles] = useState<File[]>([]);
  const [currentAdditionalMedia, setCurrentAdditionalMedia] = useState<string[]>(event.additionalMedia || []);
  const [country, setCountry] = useState(event.country);
  const [coordinates, setCoordinates] = useState(event.coordinates || '');
  const [address, setAddress] = useState(event.address);
  const [phone, setPhone] = useState(event.contact.phone || '');
  const [email, setEmail] = useState(event.contact.email || '');
  const [website, setWebsite] = useState(event.contact.website || '');

  const eventTypes = getEventTypesByCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // Add event ID
      formData.append('eventId', event._id);

      // Add user ID
      formData.append('userId', event.organizer.id);

      // Add form data
      formData.append('type', type);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('country', country);
      formData.append('coordinates', coordinates);
      formData.append('address', address);
      formData.append('phone', phone);
      formData.append('email', email);
      formData.append('website', website);

      // Add main media if changed
      if (mainMediaFile) {
        formData.append('mainMedia', mainMediaFile);
      }
      formData.append('currentMainMedia', currentMainMedia);

      // Add additional media
      additionalMediaFiles.forEach(file => {
        formData.append('additionalMedia', file);
      });
      formData.append('currentAdditionalMedia', JSON.stringify(currentAdditionalMedia));

      // Add place ID if event is associated with a place
      if (event.organizer.type === 'place') {
        formData.append('placeId', event.organizer.id);
      }

      await updateEvent(formData);
      onClose();
    } catch (err) {
      // Error handling is managed by the hook
    }
  };

  const handleMainImageRemove = () => {
    setMainMediaFile(null);
    setCurrentMainMedia('');
  };

  const handleAdditionalImageRemove = (index: number, isExisting?: boolean) => {
    if (isExisting) {
      setCurrentAdditionalMedia(prev => prev.filter((_, i) => i !== index));
    } else {
      setAdditionalMediaFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <MobileFormLayout>
      <MobileFormHeader 
        title="Modifier l'événement"
        onClose={onClose}
      />
      <MobileFormError error={error} />

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3">
        <div className="space-y-4">
          {/* Type d'événement */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Type d'événement *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight"
              required
            >
              <option value="">Sélectionner un type</option>
              {Object.entries(eventTypes).map(([category, types]) => (
                <optgroup key={category} label={category}>
                  {types.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              placeholder="Entrez le nom de votre événement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={description}
              placeholder="Décrivez votre événement"
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight min-h-[100px] resize-none"
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Date de début *
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Date de fin *
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight"
                required
              />
            </div>
          </div>

          {/* Images */}
          <MobileImageUpload
            label="Image principale"
            required
            image={mainMediaFile}
            onImageSelect={setMainMediaFile}
            onImageRemove={handleMainImageRemove}
            currentImageUrl={currentMainMedia}
          />

          <MobileMultipleImageUpload
            label="Images additionnelles"
            images={additionalMediaFiles}
            onImagesSelect={(files) => setAdditionalMediaFiles(prev => [...prev, ...files])}
            onImageRemove={handleAdditionalImageRemove}
            maxImages={5}
            currentImages={currentAdditionalMedia}
          />

          {/* Localisation */}
          <MobileLocationPicker
            selectedCountry={country}
            coordinates={coordinates}
            locationDetails={address}
            onCountryChange={setCountry}
            onCoordinatesChange={setCoordinates}
            onLocationDetailsChange={setAddress}
            initialMode={event.coordinates ? 'current' : 'manual'}
          />

          {/* Contact */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700">
              Contact du promoteur *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Numéro de téléphone"
              className="w-full p-2 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Adresse email"
              className="w-full p-2 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight"
            />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Site web"
              className="w-full p-2 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight"
            />
          </div>
        </div>
      </form>

      <MobileFormActions
        onCancel={onClose}
        isSubmitting={isLoading}
        submitLabel="Modifier l'événement"
        onSubmit={handleSubmit}
      />
    </MobileFormLayout>
  );
}