'use client';

import { useState } from 'react';
import { useEventForm } from '@/hooks/useEventForm';
import { getEventTypesByCategory } from '@/lib/event-types';
import FormLayout from './common/FormLayout';
import FormHeader from './common/FormHeader';
import FormError from './common/FormError';
import ImageUpload from './common/ImageUpload';
import MultipleImageUpload from './common/MultipleImageUpload';
import LocationPicker from './common/LocationPicker';
import ContactForm from './common/ContactForm';
import FormActions from './common/FormActions';

interface EventFormProps {
  onClose: () => void;
  placeId?: string;
}

export default function EventForm({ onClose, placeId }: EventFormProps) {
  const { submitEvent, isLoading, error } = useEventForm();
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mainMedia, setMainMedia] = useState<File | null>(null);
  const [additionalMedia, setAdditionalMedia] = useState<File[]>([]);
  const [country, setCountry] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  const eventTypes = getEventTypesByCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitEvent({
        title,
        type,
        description,
        startDate,
        endDate,
        mainMedia,
        additionalMedia,
        country,
        coordinates,
        address,
        phone,
        email,
        website,
        placeId
      });
      onClose();
    } catch (err) {
      // Error handling is managed by the hook
    }
  };

  return (
    <FormLayout>
      <FormHeader 
        title="Créer un événement"
        onClose={onClose} 
      />
      <FormError error={error} />

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Type d'événement */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-700 mb-2">
            Type d'événement *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
          <label className="block text-xs sm:text-sm text-gray-700 mb-2">
            Nom *
          </label>
          <input
            type="text"
            placeholder="Entrez le nom de votre événement"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={description}
            placeholder="Décrivez votre événement"
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[150px] resize-y"
            required
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 mb-2">
              Date de début *
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 mb-2">
              Date de fin *
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Images */}
        <ImageUpload
          label="Image principale"
          required
          image={mainMedia}
          onImageSelect={setMainMedia}
          onImageRemove={() => setMainMedia(null)}
          className="mb-6"
        />

        <MultipleImageUpload
          label="Images additionnelles"
          images={additionalMedia}
          onImagesSelect={(files) => setAdditionalMedia(prev => [...prev, ...files])}
          onImageRemove={(index) => setAdditionalMedia(prev => prev.filter((_, i) => i !== index))}
          maxImages={5}
          className="mb-6"
        />

        {/* Localisation */}
        <LocationPicker
          selectedCountry={country}
          coordinates={coordinates}
          locationDetails={address}
          onCountryChange={setCountry}
          onCoordinatesChange={setCoordinates}
          onLocationDetailsChange={setAddress}
          className="mb-6"
        />

        {/* Contact */}
        <ContactForm
          phone={phone}
          email={email}
          website={website}
          onPhoneChange={setPhone}
          onEmailChange={setEmail}
          onWebsiteChange={setWebsite}
          className="mb-6"
        />

        {/* Actions */}
        <FormActions
          onCancel={onClose}
          isSubmitting={isLoading}
          submitLabel="Créer l'événement"
        />
      </form>
    </FormLayout>
  );
}