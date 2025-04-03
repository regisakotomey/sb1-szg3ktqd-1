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

interface PlaceFormProps {
  onClose: () => void;
}

interface OpeningHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export default function PlaceForm({ onClose }: PlaceFormProps) {
  const { submitPlace, isLoading, error } = usePlaceForm();
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [services, setServices] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [country, setCountry] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([
    { day: 'Lundi', isOpen: false, openTime: '', closeTime: '' },
    { day: 'Mardi', isOpen: false, openTime: '', closeTime: '' },
    { day: 'Mercredi', isOpen: false, openTime: '', closeTime: '' },
    { day: 'Jeudi', isOpen: false, openTime: '', closeTime: '' },
    { day: 'Vendredi', isOpen: false, openTime: '', closeTime: '' },
    { day: 'Samedi', isOpen: false, openTime: '', closeTime: '' },
    { day: 'Dimanche', isOpen: false, openTime: '', closeTime: '' }
  ]);

  const placeTypes = getPlaceTypesByCategory();

  const updateOpeningHours = (index: number, field: keyof OpeningHours, value: string | boolean) => {
    setOpeningHours(prev => prev.map((hour, i) => 
      i === index ? { ...hour, [field]: value } : hour
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainImage) return;

    try {
      await submitPlace({
        type,
        name,
        shortDescription,
        longDescription,
        services,
        logo,
        mainImage,
        additionalImages: additionalImages.length > 0 ? additionalImages : undefined,
        country,
        coordinates,
        locationDetails,
        openingHours,
        phone,
        email,
        website
      });
      onClose();
    } catch (err) {
      // Error handling is managed by the hook
    }
  };

  return (
    <FormLayout>
      <FormHeader title="Ajouter un lieu" onClose={onClose} />
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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

        {/* Nom du lieu */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Nom du lieu *
          </label>
          <input
            type="text"
            value={name}
            placeholder="Entrer le nom du lieu"
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        {/* Descriptions */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Courte description *
          </label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Résumé en quelques mots"
            maxLength={100}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
            placeholder="Description complète du lieu"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[150px] resize-y"
          />
        </div>

        {/* Services */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Services / Produits fournis
          </label>
          <textarea
            value={services}
            onChange={(e) => setServices(e.target.value)}
            placeholder="Liste des services et produits disponibles"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px] resize-y"
          />
        </div>

        {/* Images */}
        <ImageUpload
          label="Logo"
          image={logo}
          onImageSelect={setLogo}
          onImageRemove={() => setLogo(null)}
          className="mb-6"
        />

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
                    onChange={(e) => updateOpeningHours(index, 'isOpen', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Ouvert</span>
                </label>
                {day.isOpen && (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={day.openTime}
                      onChange={(e) => updateOpeningHours(index, 'openTime', e.target.value)}
                      className="p-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <span>à</span>
                    <input
                      type="time"
                      value={day.closeTime}
                      onChange={(e) => updateOpeningHours(index, 'closeTime', e.target.value)}
                      className="p-2 border border-gray-300 rounded-lg text-sm"
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
          submitLabel="Créer le lieu"
        />
      </form>
    </FormLayout>
  );
}