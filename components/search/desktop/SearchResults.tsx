'use client';

import { Calendar, MapPin, Briefcase, Store, ShoppingBag, User, Image } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { SearchResult } from '@/types/search';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
}

export default function SearchResults({ results, isLoading, query }: SearchResultsProps) {
  const router = useRouter();

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'place':
        return <MapPin className="w-5 h-5 text-blue-500" />;
      case 'opportunity':
        return <Briefcase className="w-5 h-5 text-green-500" />;
      case 'shop':
        return <Store className="w-5 h-5 text-orange-500" />;
      case 'product':
        return <ShoppingBag className="w-5 h-5 text-red-500" />;
      case 'user':
        return <User className="w-5 h-5 text-gray-500" />;
      case 'ad':
        return <Image className="w-5 h-5 text-indigo-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Commencez votre recherche</h2>
        <p className="text-gray-600">
          Saisissez un terme pour rechercher des événements, lieux, opportunités et plus encore.
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Aucun résultat trouvé</h2>
        <p className="text-gray-600">
          Aucun résultat ne correspond à votre recherche "{query}".
          Essayez avec d'autres termes ou filtres.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div
          key={`${result.type}-${result.id}`}
          onClick={() => router.push(result.url)}
          className="bg-white rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex gap-4">
            {result.image ? (
              <img
                src={result.image}
                alt={result.title}
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                {getIcon(result.type)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getIcon(result.type)}
                <span className="text-sm font-medium text-gray-500 capitalize">
                  {result.type}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                {result.title}
              </h3>

              {result.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {result.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {result.date && (
                  <span className="text-gray-500">
                    {format(new Date(result.date), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                )}

                {result.location && (
                  <span className="text-gray-500 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {result.location}
                  </span>
                )}

                {result.price && (
                  <span className="text-gray-900 font-medium">
                    {result.price.toFixed(2)} €
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}