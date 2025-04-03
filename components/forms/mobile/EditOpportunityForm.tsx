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
import { Opportunity } from '@/types/opportunity';

interface EditOpportunityFormProps {
  opportunity: Opportunity;
  onClose: () => void;
}

export default function EditOpportunityForm({ opportunity, onClose }: EditOpportunityFormProps) {
  const { updateOpportunity, isLoading, error } = useOpportunityForm();
  const [type, setType] = useState(opportunity.type);
  const [title, setTitle] = useState(opportunity.title);
  const [description, setDescription] = useState(opportunity.description);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [currentMainImage, setCurrentMainImage] = useState(opportunity.mainImage);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [currentAdditionalImages, setCurrentAdditionalImages] = useState<string[]>(opportunity.additionalImages || []);
  const [country, setCountry] = useState(opportunity.country);
  const [coordinates, setCoordinates] = useState(opportunity.coordinates || '');
  const [locationDetails, setLocationDetails] = useState(opportunity.locationDetails);
  const [phone, setPhone] = useState(opportunity.contact.phone || '');
  const [email, setEmail] = useState(opportunity.contact.email || '');
  const [website, setWebsite] = useState(opportunity.contact.website || '');

  const opportunityTypes = getOpportunityTypesByCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // Add opportunity ID
      formData.append('opportunityId', opportunity._id);

      // Add user ID
      formData.append('userId', opportunity.organizer.id);

      // Add form data
      formData.append('type', type);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('country', country);
      formData.append('coordinates', coordinates);
      formData.append('locationDetails', locationDetails);
      formData.append('phone', phone);
      formData.append('email', email);
      formData.append('website', website);

      // Add main image if changed
      if (mainImage) {
        formData.append('mainImage', mainImage);
      }
      formData.append('currentMainImage', currentMainImage);

      // Add additional images
      additionalImages.forEach(file => {
        formData.append('additionalImages', file);
      });
      formData.append('currentAdditionalImages', JSON.stringify(currentAdditionalImages));

      await updateOpportunity(formData);
      onClose();
    } catch (err) {
      // Error handling is managed by the hook
    }
  };

  const handleMainImageRemove = () => {
    setMainImage(null);
    setCurrentMainImage('');
  };

  const handleAdditionalImageRemove = (index: number, isExisting?: boolean) => {
    if (isExisting) {
      setCurrentAdditionalImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <MobileFormLayout>
      <MobileFormHeader 
        title="Modifier l'opportunité"
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
            onImageRemove={handleMainImageRemove}
            currentImageUrl={currentMainImage}
          />

          <MobileMultipleImageUpload
            label="Images additionnelles"
            images={additionalImages}
            onImagesSelect={(files) => setAdditionalImages(prev => [...prev, ...files])}
            onImageRemove={handleAdditionalImageRemove}
            maxImages={5}
            currentImages={currentAdditionalImages}
          />

          {/* Localisation */}
          <MobileLocationPicker
            selectedCountry={country}
            coordinates={coordinates}
            locationDetails={locationDetails}
            onCountryChange={setCountry}
            onCoordinatesChange={setCoordinates}
            onLocationDetailsChange={setLocationDetails}
            initialMode={coordinates ? 'current' : 'manual'}
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
        submitLabel="Modifier l'opportunité"
        onSubmit={handleSubmit}
      />
    </MobileFormLayout>
  );
}