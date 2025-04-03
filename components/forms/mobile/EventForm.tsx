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

interface EventFormProps {
  onClose: () => void;
  placeId?: string;
}

export default function MobileEventForm({ onClose, placeId }: EventFormProps) {
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
    if (!mainMedia) return;

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
    <MobileFormLayout>
      <MobileFormHeader 
        title="Créer un événement"
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
            {types.map((type) => (
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
      image={mainMedia}
      onImageSelect={setMainMedia}
      onImageRemove={() => setMainMedia(null)}
    />

    <MobileMultipleImageUpload
      label="Images additionnelles"
      images={additionalMedia}
      onImagesSelect={(files) => setAdditionalMedia((prev) => [...prev, ...files])}
      onImageRemove={(index) => setAdditionalMedia((prev) => prev.filter((_, i) => i !== index))}
      maxImages={5}
    />

    {/* Localisation */}
    <MobileLocationPicker
      selectedCountry={country}
      coordinates={coordinates}
      locationDetails={address}
      onCountryChange={setCountry}
      onCoordinatesChange={setCoordinates}
      onLocationDetailsChange={setAddress}
    />

    {/* Contact */}
    <div className="space-y-3">
      <label className="block text-sm text-gray-700 mb-1">
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
        submitLabel="Créer l'événement"
        onSubmit={handleSubmit}
      />
    </MobileFormLayout>
  );
}