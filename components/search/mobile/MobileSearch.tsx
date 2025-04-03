'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, X, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import SearchResults from './SearchResults';
import SearchFilters from './SearchFilters';

interface MobileSearchProps {
  initialQuery: string;
}

export default function MobileSearch({ initialQuery }: MobileSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    types: [] as string[],
    date: null as string | null,
    location: null as string | null,
    priceRange: null as [number, number] | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: debouncedQuery,
          ...(filters.types.length && { types: filters.types.join(',') }),
          ...(filters.date && { date: filters.date }),
          ...(filters.location && { location: filters.location }),
          ...(filters.priceRange && { 
            minPrice: filters.priceRange[0].toString(),
            maxPrice: filters.priceRange[1].toString()
          })
        });

        const response = await fetch(`/api/search?${params}`);
        if (!response.ok) throw new Error('Erreur lors de la recherche');
        
        const data = await response.json();
        setResults(data.results);

        // Update URL without reloading
        router.replace(`/content/search?${params}`, { scroll: false });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, filters, router]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <main className="flex-1 flex flex-col h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="flex items-center h-14 px-4 bg-white border-b border-gray-200">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 flex items-center gap-2 mx-2">
          <div className="relative flex-1">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-8 py-2 bg-gray-100 rounded-full text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-full transition-colors ${
              showFilters 
                ? 'bg-primary text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Filters Sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-white">
          <SearchFilters
            filters={filters}
            onChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        <SearchResults
          results={results}
          isLoading={isLoading}
          query={query}
        />
      </div>
    </main>
  );
}