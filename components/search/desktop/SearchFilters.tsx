'use client';

import { Calendar, MapPin, Tag } from 'lucide-react';

interface SearchFiltersProps {
  filters: {
    types: string[];
    date: string | null;
    location: string | null;
    priceRange: [number, number] | null;
  };
  onChange: (filters: SearchFiltersProps['filters']) => void;
}

const contentTypes = [
  { value: 'event', label: 'Événements' },
  { value: 'place', label: 'Lieux' },
  { value: 'opportunity', label: 'Opportunités' },
  { value: 'shop', label: 'Boutiques' },
  { value: 'product', label: 'Produits' },
  { value: 'user', label: 'Utilisateurs' },
  { value: 'ad', label: 'Spots publicitaires' }
];

export default function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const handleTypeToggle = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    
    onChange({ ...filters, types: newTypes });
  };

  const handleDateChange = (date: string | null) => {
    onChange({ ...filters, date });
  };

  const handleLocationChange = (location: string | null) => {
    onChange({ ...filters, location });
  };

  const handlePriceRangeChange = (range: [number, number] | null) => {
    onChange({ ...filters, priceRange: range });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="font-semibold mb-6">Filtres</h2>

      {/* Types de contenu */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Type de contenu</h3>
        <div className="space-y-2">
          {contentTypes.map((type) => (
            <label key={type.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.types.includes(type.value)}
                onChange={() => handleTypeToggle(type.value)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Date</h3>
        <div className="space-y-2">
          <select
            value={filters.date || ''}
            onChange={(e) => handleDateChange(e.target.value || null)}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="tomorrow">Demain</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
        </div>
      </div>

      {/* Localisation */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Localisation</h3>
        <div className="space-y-2">
          <select
            value={filters.location || ''}
            onChange={(e) => handleLocationChange(e.target.value || null)}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Toutes les localisations</option>
            <option value="nearby">À proximité</option>
            <option value="city">Dans ma ville</option>
            <option value="region">Dans ma région</option>
            <option value="country">Dans mon pays</option>
          </select>
        </div>
      </div>

      {/* Prix */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Fourchette de prix</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceRange?.[0] || ''}
            onChange={(e) => {
              const min = parseFloat(e.target.value);
              const max = filters.priceRange?.[1] || Infinity;
              handlePriceRangeChange(e.target.value ? [min, max] : null);
            }}
            className="w-1/2 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceRange?.[1] || ''}
            onChange={(e) => {
              const min = filters.priceRange?.[0] || 0;
              const max = parseFloat(e.target.value);
              handlePriceRangeChange(e.target.value ? [min, max] : null);
            }}
            className="w-1/2 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => onChange({
          types: [],
          date: null,
          location: null,
          priceRange: null
        })}
        className="w-full p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
}