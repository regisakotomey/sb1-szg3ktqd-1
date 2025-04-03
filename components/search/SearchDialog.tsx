'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import SearchResults from './SearchResults';
import { SearchResult } from '@/types/search';

interface SearchDialogProps {
  isOpen: boolean;
  query: string;
  onClose: () => void;
}

export default function SearchDialog({ isOpen, query, onClose }: SearchDialogProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Erreur lors de la recherche');
        
        const data = await response.json();
        setResults(data.results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="container mx-auto max-w-3xl pt-20 px-4">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="relative">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" />
              </div>
            ) : (
              <SearchResults results={results} onClose={onClose} />
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
}