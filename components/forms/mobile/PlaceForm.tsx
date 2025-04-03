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

interface PlaceFormProps {
  onClose: () => void;
}

interface OpeningHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export default function MobilePlaceForm({ onClose }: PlaceFormProps) {
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
    <MobileFormLayout>
      <MobileFormHeader title="Ajouter un lieu" onClose={onClose} />
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
            onImageRemove={() => setLogo(null)}
          />

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
                        onChange={(e) => updateOpeningHours(index, 'isOpen', e.target.checked)}
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
                        onChange={(e) => updateOpeningHours(index, 'openTime', e.target.value)}
                        className="flex-1 p-2 text-sm border border-gray-300 rounded-lg"
                      />
                      <span className="text-sm self-center">à</span>
                      <input
                        type="time"
                        value={day.closeTime}
                        onChange={(e) => updateOpeningHours(index, 'closeTime', e.target.value)}
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
        submitLabel="Créer le lieu"
        onSubmit={handleSubmit}
      />
    </MobileFormLayout>
  );
}