'use client';

import { useState } from 'react';
import { useShopForm } from '@/hooks/useShopForm';
import { getShopTypesByCategory } from '@/lib/shop-types';
import { countries } from '@/lib/countries';
import MobileFormLayout from './common/MobileFormLayout';
import MobileFormHeader from './common/MobileFormHeader';
import MobileFormError from './common/MobileFormError';
import MobileImageUpload from './common/MobileImageUpload';
import MobileFormActions from './common/MobileFormActions';
import { Shop } from '@/types/shop';

interface EditShopFormProps {
  shop: Shop;
  onClose: () => void;
}

export default function EditShopForm({ shop, onClose }: EditShopFormProps) {
  const { updateShop, isLoading, error } = useShopForm();
  const [type, setType] = useState(shop.type);
  const [name, setName] = useState(shop.name);
  const [description, setDescription] = useState(shop.description);
  const [logo, setLogo] = useState<File | null>(null);
  const [currentLogo, setCurrentLogo] = useState(shop.logo);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(shop.countries);
  const [newCountry, setNewCountry] = useState('');
  const [phone, setPhone] = useState(shop.contact.phone || '');
  const [email, setEmail] = useState(shop.contact.email || '');
  const [website, setWebsite] = useState(shop.contact.website || '');

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
      const formData = new FormData();

      // Add shop ID
      formData.append('shopId', shop._id);

      // Add user ID
      formData.append('userId', shop.organizer.id);

      // Add form data
      formData.append('type', type);
      formData.append('name', name);
      formData.append('description', description);
      selectedCountries.forEach(country => {
        formData.append('countries[]', country);
      });
      formData.append('phone', phone);
      formData.append('email', email);
      formData.append('website', website);

      // Add logo if changed
      if (logo) {
        formData.append('logo', logo);
      }
      formData.append('currentLogo', currentLogo || '');

      await updateShop(formData);
      onClose();
    } catch (err) {
      // Error handling is managed by the hook
    }
  };

  const handleLogoRemove = () => {
    setLogo(null);
    setCurrentLogo('');
  };

  return (
    <MobileFormLayout>
      <MobileFormHeader 
        title="Modifier la boutique"
        onClose={onClose}
      />
      <MobileFormError error={error} />

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3">
        <div className="space-y-4">
          {/* Type de boutique */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Type de boutique *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight"
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

          {/* Nom et description */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Nom de la boutique *
            </label>
            <input
              type="text"
              value={name}
              placeholder="Entrer le nom"
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={description}
              placeholder="Entrer la description"
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight min-h-[120px] resize-none"
              required
            />
          </div>

          {/* Logo */}
          <MobileImageUpload
            label="Logo"
            image={logo}
            onImageSelect={setLogo}
            onImageRemove={handleLogoRemove}
            currentImageUrl={currentLogo}
          />

          {/* Pays desservis */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Pays desservis *
            </label>
            <div className="grid grid-cols-[1fr,auto] gap-2 mb-3">
              <select
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight"
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
                className="whitespace-nowrap px-3 py-2 bg-gray-900 text-white rounded-lg text-sm"
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
        submitLabel="Modifier la boutique"
        onSubmit={handleSubmit}
      />
    </MobileFormLayout>
  );
}