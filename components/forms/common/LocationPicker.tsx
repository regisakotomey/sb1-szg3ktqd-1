'use client';

import { useState, useEffect } from 'react';
import { countries } from '@/lib/countries';
import { getUserCountry, getUserLocation } from '@/lib/geolocation';

interface LocationPickerProps {
  selectedCountry: string;
  coordinates: string;
  locationDetails: string;
  onCountryChange: (country: string) => void;
  onCoordinatesChange: (coordinates: string) => void;
  onLocationDetailsChange: (details: string) => void;
  className?: string;
  initialMode?: 'current' | 'manual';
}

export default function LocationPicker({
  selectedCountry,
  coordinates,
  locationDetails,
  onCountryChange,
  onCoordinatesChange,
  onLocationDetailsChange,
  className = '',
  initialMode
}: LocationPickerProps) {
  const [useCurrentLocation, setUseCurrentLocation] = useState(initialMode === 'current');
  const [showManualLocation, setShowManualLocation] = useState(initialMode === 'manual');
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  useEffect(() => {
    if (initialMode === 'current' && coordinates) {
      setUseCurrentLocation(true);
      setShowManualLocation(false);
    } else if (initialMode === 'manual') {
      setUseCurrentLocation(false);
      setShowManualLocation(true);
    }
  }, [initialMode, coordinates]);

  const handleLocationChoice = async (choice: 'current' | 'manual') => {
    if (choice === 'current') {
      setIsLocationLoading(true);
      setUseCurrentLocation(true);
      setShowManualLocation(false);
      
      try {
        const [countryCode, location] = await Promise.all([
          getUserCountry(),
          getUserLocation()
        ]);
        
        const country = countries.find(c => c.code === countryCode);
        if (country) {
          onCountryChange(country.name);
          onCoordinatesChange(location);
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setShowManualLocation(true);
      } finally {
        setIsLocationLoading(false);
      }
    } else {
      setUseCurrentLocation(false);
      setShowManualLocation(true);
      if (!initialMode) {
        onCountryChange('');
        onCoordinatesChange('');
      }
    }
  };

  return (
    <div className={className}>
      <label className="block text-xs sm:text-sm text-gray-700 mb-2">
        Localisation *
      </label>
      <div className="flex gap-4 mb-4">
        <button
          type="button"
          onClick={() => handleLocationChoice('current')}
          className={`flex-1 p-2.5 sm:p-3 rounded-lg border transition-colors text-xs sm:text-sm ${
            useCurrentLocation
              ? 'bg-gray-100 border-gray-300'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
          disabled={isLocationLoading}
        >
          {isLocationLoading ? 'Détection...' : 'Position actuelle'}
        </button>
        <button
          type="button"
          onClick={() => handleLocationChoice('manual')}
          className={`flex-1 p-2.5 sm:p-3 rounded-lg border transition-colors text-xs sm:text-sm ${
            showManualLocation
              ? 'bg-gray-100 border-gray-300'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          Saisie manuelle
        </button>
      </div>

      {(showManualLocation || useCurrentLocation) && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm text-gray-700 mb-2">
                Pays *
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => onCountryChange(e.target.value)}
                className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                disabled={useCurrentLocation}
              >
                <option value="">Sélectionner un pays</option>
                {countries.map(country => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {useCurrentLocation && coordinates && (
              <div>
                <label className="block text-xs sm:text-sm text-gray-700 mb-2">
                  Coordonnées
                </label>
                <input
                  type="text"
                  value={coordinates}
                  className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm text-gray-700 mb-2">
              Indication du lieu *
            </label>
            <input
              type="text"
              value={locationDetails}
              onChange={(e) => onLocationDetailsChange(e.target.value)}
              placeholder="Ex: 123 rue du Commerce, 75001"
              className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
        </div>
      )}
    </div>
  );
}