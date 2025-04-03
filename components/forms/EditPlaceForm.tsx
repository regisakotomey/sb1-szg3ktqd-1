'use client';

import { useState } from 'react';
import { usePlaceForm } from '@/hooks/usePlaceForm';
import { getPlaceTypesByCategory } from '@/lib/place-types';
import FormLayout from './common/FormLayout';
import FormHeader from './common/FormHeader';
import FormError from './common/FormError';
import ImageUpload from './common/ImageUpload';
import MultipleImageUpload from './common/MultipleImageUpload';
import LocationPicker from './common/LocationPicker';
import ContactForm from './common/ContactForm';
import FormActions from './common/FormActions';
import { Place } from '@/types/place';

interface EditPlaceFormProps {
  place: Place;
  onClose: () => void;
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
  const [openingHours, setOpeningHours] = useState(place.openingHours);
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
    <FormLayout>
      <FormHeader 
        title="Modifier le lieu"
        onClose={onClose}
      />
      <FormError error={error} />

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Type de lieu */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Type de lieu *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
          <label className="block text-sm text-gray-700 mb-2">
            Nom du lieu *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Courte description *
          </label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            maxLength={100}
            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Description détaillée
          </label>
          <textarea
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[150px] resize-y"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Services / Produits fournis
          </label>
          <textarea
            value={services}
            onChange={(e) => setServices(e.target.value)}
            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px] resize-y"
          />
        </div>

        {/* Images */}
        <ImageUpload
          label="Logo"
          image={logo}
          onImageSelect={setLogo}
          onImageRemove={handleLogoRemove}
          className="mb-6"
          currentImageUrl={currentLogo}
        />

        <ImageUpload
          label="Image principale"
          required
          image={mainImage}
          onImageSelect={setMainImage}
          onImageRemove={handleMainImageRemove}
          className="mb-6"
          currentImageUrl={currentMainImage}
        />

        <MultipleImageUpload
          label="Images additionnelles"
          images={additionalImages}
          onImagesSelect={(files) => setAdditionalImages(prev => [...prev, ...files])}
          onImageRemove={handleAdditionalImageRemove}
          maxImages={5}
          className="mb-6"
          currentImages={currentAdditionalImages}
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
          initialMode={coordinates ? 'current' : 'manual'}
        />

        {/* Horaires d'ouverture */}
        <div>
          <label className="block text-sm text-gray-700 mb-4">
            Horaires d'ouverture *
          </label>
          <div className="space-y-4">
            {openingHours.map((day, index) => (
              <div
                key={day.day}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-24">{day.day}</div>
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
                {day.isOpen && (
                  <div className="flex items-center gap-2 flex-1">
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
                      className="p-2 text-sm border border-gray-300 rounded-lg"
                    />
                    <span>à</span>
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
                      className="p-2 text-sm border border-gray-300 rounded-lg"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

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
          submitLabel="Modifier le lieu"
        />
      </form>
    </FormLayout>
  );
}