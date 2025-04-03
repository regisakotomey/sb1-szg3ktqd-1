'use client';

import { useState } from 'react';
import { useShopForm } from '@/hooks/useShopForm';
import { getShopTypesByCategory } from '@/lib/shop-types';
import { countries } from '@/lib/countries';
import FormLayout from './common/FormLayout';
import FormHeader from './common/FormHeader';
import FormError from './common/FormError';
import ImageUpload from './common/ImageUpload';
import ContactForm from './common/ContactForm';
import FormActions from './common/FormActions';

interface ShopFormProps {
  onClose: () => void;
  placeId?: string;
}

export default function ShopForm({ onClose, placeId }: ShopFormProps) {
  const { submitShop, isLoading, error } = useShopForm();
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [newCountry, setNewCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  const shopTypes = getShopTypesByCategory();

  const addCountry = () => {
    if (newCountry && !selectedCountries.includes(newCountry)) {
      setSelectedCountries([...selectedCountries, newCountry]);
      setNewCountry('');
    }
  };

  const removeCountry = (countryToRemove: string) => {
    setSelectedCountries(selectedCountries.filter(country => country !== countryToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitShop({
        type,
        name,
        description,
        logo,
        countries: selectedCountries,
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
      <FormHeader title="Ajouter une boutique" onClose={onClose} />
      <FormError error={error} />

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Type de boutique */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Type de boutique *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value="">Sélectionner un type</option>
            {Object.entries(shopTypes).map(([category, types]) => (
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

        {/* Nom de la boutique */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Nom de la boutique *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[150px] resize-y"
            required
          />
        </div>

        {/* Logo */}
        <ImageUpload
          label="Logo"
          image={logo}
          onImageSelect={setLogo}
          onImageRemove={() => setLogo(null)}
          className="mb-6"
        />

        {/* Pays desservis */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Pays desservis *
          </label>
          <div className="flex gap-4 mb-4">
            <select
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Sélectionner un pays</option>
              {countries.map(country => (
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addCountry}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Ajouter
            </button>
          </div>

          {selectedCountries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCountries.map((country, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full"
                >
                  <span className="text-sm">{country}</span>
                  <button
                    type="button"
                    onClick={() => removeCountry(country)}
                    className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
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
          submitLabel="Créer la boutique"
        />
      </form>
    </FormLayout>
  );
}