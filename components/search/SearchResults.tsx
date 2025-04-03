'use client';

import { SearchResult } from '@/types/search';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Briefcase, Store, ShoppingBag, User, Image } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SearchResultsProps {
  results: SearchResult[];
  onClose: () => void;
}

export default function SearchResults({ results, onClose }: SearchResultsProps) {
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

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    onClose();
  };

  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Aucun résultat trouvé
      </div>
    );
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto">
      {results.map((result) => (
        <div
          key={`${result.type}-${result.id}`}
          onClick={() => handleResultClick(result)}
          className="flex items-start gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="flex-shrink-0">
            {result.image ? (
              <img
                src={result.image}
                alt={result.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                {getIcon(result.type)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getIcon(result.type)}
              <span className="text-sm font-medium text-gray-500 capitalize">
                {result.type}
              </span>
            </div>

            <h4 className="font-medium text-gray-900 mb-1 truncate">
              {result.title}
            </h4>

            {result.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {result.description}
              </p>
            )}

            <div className="mt-2 flex flex-wrap gap-2 text-sm">
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
      ))}
    </div>
  );
}