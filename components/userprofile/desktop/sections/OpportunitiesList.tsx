'use client';

import { useEffect } from 'react';
import { Briefcase, MapPin } from 'lucide-react';
import { Opportunity } from '@/types/opportunity';
import { getOpportunityTypeLabel } from '@/lib/opportunity-types';
import { getUserData } from '@/lib/storage';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OpportunitiesListProps {
  userId: string;
}

export default function OpportunitiesList({ userId }: OpportunitiesListProps) {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchOpportunities();
  }, [userId]);

  const fetchOpportunities = async (pageNum = 1) => {
    try {
      const response = await fetch(`/api/users/${userId}/content?type=opportunities&page=${pageNum}&limit=6`);
      if (!response.ok) throw new Error('Failed to fetch opportunities');
      
      const data = await response.json();
      if (pageNum === 1) {
        setOpportunities(data.items);
      } else {
        setOpportunities(prev => [...prev, ...data.items]);
      }
      
      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreOpportunities = () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      fetchOpportunities(page + 1);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Aucune opportunité</h3>
        <p className="text-gray-500">
          Cet utilisateur n'a pas encore créé d'opportunité.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {opportunities.map((opportunity) => (
          <div
            key={opportunity._id}
            onClick={() => router.push(`/content/opportunities/${opportunity._id}`)}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="aspect-video relative">
              <img
                src={opportunity.mainImage}
                alt={opportunity.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {getOpportunityTypeLabel(opportunity.type)}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {opportunity.title}
              </h3>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {opportunity.description}
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={14} />
                <span className="line-clamp-1">{opportunity.locationDetails}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMoreOpportunities}
            disabled={isLoadingMore}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              'Charger plus'
            )}
          </button>
        </div>
      )}
    </div>
  );
}