'use client';

import { useState } from 'react';
import { usePlaceForm } from '@/hooks/usePlaceForm';
import { getPlaceTypesByCategory } from '@/lib/place-types';
import MobileFormLayout from './common/MobileFormLayout';
import MobileFormHeader from './common/MobileFormHeader';
import MobileFormError from './common/MobileFormError';
import MobileImageUpload from './common/MobileImageUpload';
import MobileMultipleImageUpload from './common/MobileMultipleImageUpload';
import MobileLocationPicker from './common/MobileLocationPicker';
import MobileFormActions from './common/MobileFormActions';
import { Place } from '@/types/place';

interface EditPlaceFormProps {
  place: Place;
  onClose: () => void;
}

interface OpeningHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export default function EditPlaceForm({ place, onClose }: EditPlaceFormProps) {
  const { updatePlace, isLoading, error } = usePlaceForm();
  const [type, setType] = useState(place.type);
  const [name, setName] = useState(place.name);
  const [shortDescription, setShortDescription] = useState(place.shortDescription);
  const [longDescription, setLongDescription] = useState(place.longDescription || '');
  const [services, setServices] = useState(place.services || '');
  const [logo, setLogo] = useState<File | null>(null);
  const [currentLogo, setCurrentLogo] = useState(place.logo);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [currentMainImage, setCurrentMainImage] = useState(place.mainImage);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [currentAdditionalImages, setCurrentAdditionalImages] = useState<string[]>(place.additionalImages || []);
  const [country, setCountry] = useState(place.country);
  const [coordinates, setCoordinates] = useState(place.coordinates || '');
  const [locationDetails, setLocationDetails] = useState(place.locationDetails);
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>(place.openingHours);
  const [phone, setPhone] = useState(place.contact.phone || '');
  const [email, setEmail] = useState(place.contact.email || '');
  const [website, setWebsite] = useState(place.contact.website || '');

  const placeTypes = getPlaceTypesByCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // Add place ID
      formData.append('placeId', place._id);

      // Add user ID
      formData.append('userId', place.organizer.id);

      // Add form data
      formData.append('type', type);
      formData.append('name', name);
      formData.append('shortDescription', shortDescription);
      formData.append('longDescription', longDescription);
      formData.append('services', services);
      formData.append('country', country);
      formData.append('coordinates', coordinates);
      formData.append('locationDetails', locationDetails);
      formData.append('openingHours', JSON.stringify(openingHours));
      formData.append('phone', phone);
      formData.append('email', email);
      formData.append('website', website);

      // Add logo if changed
      if (logo) {
        formData.append('logo', logo);
      }
      formData.append('currentLogo', currentLogo || '');

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

      await updatePlace(formData);
      onClose();
    } catch (err) {
      // Error handling is managed by the hook
    }
  };

  const handleLogoRemove = () => {
    setLogo(null);
    setCurrentLogo('');
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
        title="Modifier le lieu"
        onClose={onClose}
      />
      <MobileFormError error={error} />

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3">
        <div className="space-y-4">
          {/* Type de lieu */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Type de lieu *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight"
              required
            >
              <option value="">Sélectionner un type</option>
              {Object.entries(placeTypes).map(([category, types]) => (
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

          {/* Nom et descriptions */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Nom du lieu *
            </label>
            <input
              type="text"
              value={name}
              placeholder="Entrer le nom du lieu"
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Courte description *
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Résumé en quelques mots"
              maxLength={100}
              className="w-full p-2 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Description détaillée
            </label>
            <textarea
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              placeholder="Description complète du lieu"
              className="w-full p-2 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight min-h-[100px] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Services / Produits fournis
            </label>
            <textarea
              value={services}
              onChange={(e) => setServices(e.target.value)}
              placeholder="Liste des services et produits disponibles"
              className="w-full p-2 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight min-h-[80px] resize-none"
            />
          </div>

          {/* Images */}
          <MobileImageUpload
            label="Logo"
            image={logo}
            onImageSelect={setLogo}
            onImageRemove={handleLogoRemove}
            currentImageUrl={currentLogo}
          />

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

          {/* Horaires d'ouverture */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Horaires d'ouverture *
            </label>
            <div className="space-y-3">
              {openingHours.map((day, index) => (
                <div
                  key={day.day}
                  className="bg-gray-50 rounded-lg p-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">{day.day}</span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={day.isOpen}
                        onChange={(e) => {
                          const newHours = [...openingHours];
                          newHours[index] = {
                            ...day,
                            isOpen: e.target.checked
                          };
                          setOpeningHours(newHours);
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Ouvert</span>
                    </label>
                  </div>
                  {day.isOpen && (
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={day.openTime}
                        onChange={(e) => {
                          const newHours = [...openingHours];
                          newHours[index] = {
                            ...day,
                            openTime: e.target.value
                          };
                          setOpeningHours(newHours);
                        }}
                        className="flex-1 p-2 text-sm border border-gray-300 rounded-lg"
                      />
                      <span className="text-sm self-center">à</span>
                      <input
                        type="time"
                        value={day.closeTime}
                        onChange={(e) => {
                          const newHours = [...openingHours];
                          newHours[index] = {
                            ...day,
                            closeTime: e.target.value
                          };
                          setOpeningHours(newHours);
                        }}
                        className="flex-1 p-2 text-sm border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

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
        submitLabel="Modifier le lieu"
        onSubmit={handleSubmit}
      />
    </MobileFormLayout>
  );
}