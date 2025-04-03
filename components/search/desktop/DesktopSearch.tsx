'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import SearchResults from './SearchResults';
import SearchFilters from './SearchFilters';

interface DesktopSearchProps {
  initialQuery: string;
}

export default function DesktopSearch({ initialQuery }: DesktopSearchProps) {
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
    <main className="flex-1 pt-[76px] mx-auto w-full max-w-[1200px] transition-all">
      <div className="p-6">
        {/* Search Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border transition-colors ${
              showFilters 
                ? 'bg-primary text-white border-primary'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <SearchFilters
                filters={filters}
                onChange={handleFilterChange}
              />
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            <SearchResults
              results={results}
              isLoading={isLoading}
              query={query}
            />
          </div>
        </div>
      </div>
    </main>
  );
}