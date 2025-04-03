'use client';

import { useState } from 'react';
import { useOpportunityForm } from '@/hooks/useOpportunityForm';
import { getOpportunityTypesByCategory } from '@/lib/opportunity-types';
import FormLayout from './common/FormLayout';
import FormHeader from './common/FormHeader';
import FormError from './common/FormError';
import ImageUpload from './common/ImageUpload';
import MultipleImageUpload from './common/MultipleImageUpload';
import LocationPicker from './common/LocationPicker';
import ContactForm from './common/ContactForm';
import FormActions from './common/FormActions';

interface OpportunityFormProps {
  onClose: () => void;
  placeId?: string;
}

export default function OpportunityForm({ onClose, placeId }: OpportunityFormProps) {
  const { submitOpportunity, isLoading, error } = useOpportunityForm();
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [country, setCountry] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  const opportunityTypes = getOpportunityTypesByCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainImage) return;

    try {
      await submitOpportunity({
        type,
        title,
        description,
        mainImage,
        additionalImages: additionalImages.length > 0 ? additionalImages : undefined,
        country,
        coordinates,
        locationDetails,
        phone,
        email,
        website,
        placeId,
        organizerType: placeId ? 'place' : 'user'
      });
      onClose();
    } catch (err) {
      // Error handling is managed by the hook
    }
  };

  return (
    <FormLayout>
      <FormHeader title="Ajouter une opportunité" onClose={onClose} />
      <FormError error={error} />

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Type d'opportunité */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-700 mb-2">
            Type d'opportunité *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value="">Sélectionner un type</option>
            {Object.entries(opportunityTypes).map(([category, types]) => (
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
            Titre *
          </label>
          <input
            type="text"
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
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[150px] resize-y"
            required
          />
        </div>

        {/* Images */}
        <ImageUpload
          label="Image principale"
          required
          image={mainImage}
          onImageSelect={setMainImage}
          onImageRemove={() => setMainImage(null)}
          className="mb-6"
        />

        <MultipleImageUpload
          label="Images additionnelles"
          images={additionalImages}
          onImagesSelect={(files) => setAdditionalImages(prev => [...prev, ...files])}
          onImageRemove={(index) => setAdditionalImages(prev => prev.filter((_, i) => i !== index))}
          maxImages={5}
          className="mb-6"
        />

        {/* Localisation */}
        <LocationPicker
          selectedCountry={country}
          coordinates={coordinates}
          locationDetails={locationDetails}
          onCountryChange={setCountry}
          onCoordinatesChange={setCoordinates}
          onLocationDetailsChange={setLocationDetails}
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
          submitLabel="Créer l'opportunité"
        />
      </form>
    </FormLayout>
  );
}