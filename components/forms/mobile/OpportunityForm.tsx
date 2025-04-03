'use client';

import { useState } from 'react';
import { useOpportunityForm } from '@/hooks/useOpportunityForm';
import { getOpportunityTypesByCategory } from '@/lib/opportunity-types';
import MobileFormLayout from './common/MobileFormLayout';
import MobileFormHeader from './common/MobileFormHeader';
import MobileFormError from './common/MobileFormError';
import MobileImageUpload from './common/MobileImageUpload';
import MobileMultipleImageUpload from './common/MobileMultipleImageUpload';
import MobileLocationPicker from './common/MobileLocationPicker';
import MobileFormActions from './common/MobileFormActions';

interface OpportunityFormProps {
  onClose: () => void;
  placeId?: string;
}

export default function MobileOpportunityForm({ onClose, placeId }: OpportunityFormProps) {
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
        title="Créer une opportunité"
        onClose={onClose}
      />
      <MobileFormError error={error} />

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3">
        <div className="space-y-4">
          {/* Type d'opportunité */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Type d'opportunité *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight"
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
            <label className="block text-sm text-gray-700 mb-1">
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de l'opportunité"
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
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description détaillée"
              className="w-full p-2 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight min-h-[100px] resize-none"
              required
            />
          </div>

          {/* Images */}
          <MobileImageUpload
            label="Image principale"
            required
            image={mainImage}
            onImageSelect={setMainImage}
            onImageRemove={() => setMainImage(null)}
          />

          <MobileMultipleImageUpload
            label="Images additionnelles"
            images={additionalImages}
            onImagesSelect={(files) => setAdditionalImages(prev => [...prev, ...files])}
            onImageRemove={(index) => setAdditionalImages(prev => prev.filter((_, i) => i !== index))}
            maxImages={5}
          />

          {/* Localisation */}
          <MobileLocationPicker
            selectedCountry={country}
            coordinates={coordinates}
            locationDetails={locationDetails}
            onCountryChange={setCountry}
            onCoordinatesChange={setCoordinates}
            onLocationDetailsChange={setLocationDetails}
          />

          {/* Contact */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700">
              Contact *
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
        submitLabel="Créer l'opportunité"
        onSubmit={handleSubmit}
      />
    </MobileFormLayout>
  );
}