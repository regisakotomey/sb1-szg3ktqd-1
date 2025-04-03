'use client';

import { useState, useEffect } from 'react';
import { Calendar, Briefcase, Store, ChevronRight, MapPin, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getEventTypeLabel } from '@/lib/event-types';

interface EventItem {
  _id: string;
  title: string;
  type: string;
  mainMedia: string;
  startDate: string;
  locationDetails: string;
}

interface OpportunityItem {
  _id: string;
  title: string;
  type: string;
  mainImage: string;
  description: string;
  locationDetails: string;
}

interface ShopItem {
  _id: string;
  title: string;
  type: string;
  logo?: string;
  description: string;
}

interface PlaceAddedContentButtonsProps {
  placeId: string;
}

type TabType = 'events' | 'opportunities' | 'shops';

export default function PlaceAddedContentButtons({ placeId }: PlaceAddedContentButtonsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [eventsRes, opportunitiesRes, shopsRes] = await Promise.all([
          fetch(`/api/events/get?placeId=${placeId}&limit=5`),
          fetch(`/api/opportunities/get?placeId=${placeId}&limit=5`),
          fetch(`/api/shops/get?placeId=${placeId}&limit=5`)
        ]);

        const [eventsData, opportunitiesData, shopsData] = await Promise.all([
          eventsRes.json(),
          opportunitiesRes.json(),
          shopsRes.json()
        ]);

        setEvents(eventsData.events || []);
        setOpportunities(opportunitiesData.opportunities || []);
        setShops(shopsData.shops || []);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [placeId]);

  const tabs = [
    { id: 'events', label: 'Évén.', count: events.length },
    { id: 'opportunities', label: 'Opport.', count: opportunities.length },
    { id: 'shops', label: 'Bout.', count: shops.length }
  ];

  const renderEventCard = (event: EventItem) => (
    <div
      key={event._id}
      onClick={() => router.push(`/content/events/${event._id}`)}
      className="flex-none w-[200px] bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="aspect-video relative">
        <img
          src={event.mainMedia}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {getEventTypeLabel(event.type)}
        </div>
      </div>

      <div className="p-2 flex items-center gap-4">
        <div className="flex items-center justify-center border border-gray-400 rounded px-1 text-sm text-gray-600">
          <span className="text-center">{format(new Date(event.startDate), 'dd MMMM', { locale: fr })}</span>
        </div>

        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
          {event.title}
        </h3>
      </div>
    </div>
  );

  const renderOpportunityCard = (opportunity: OpportunityItem) => (
    <div
      key={opportunity._id}
      onClick={() => router.push(`/content/opportunities/${opportunity._id}`)}
      className="flex-none w-[280px] bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="aspect-[16/9] relative">
        <img
          src={opportunity.mainImage || '/placeholder-opportunity.jpg'}
          alt={opportunity.title}
          className="w-full h-full object-cover"
        />
        {opportunity.type && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {opportunity.type}
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-medium text-sm mb-2 line-clamp-2">{opportunity.title}</h4>
        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{opportunity.description}</p>
        {opportunity.locationDetails && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin size={12} />
            <span className="line-clamp-1">{opportunity.locationDetails}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderShopCard = (shop: ShopItem) => (
    <div
      key={shop._id}
      onClick={() => router.push(`/content/shops/${shop._id}`)}
      className="flex-none w-[280px] bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="aspect-square relative">
        {shop.logo ? (
          <img
            src={shop.logo}
            alt={shop.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Store size={32} className="text-gray-400" />
          </div>
        )}
        {shop.type && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {shop.type}
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-medium text-sm mb-2">{shop.title}</h4>
        <p className="text-xs text-gray-600 line-clamp-2">{shop.description}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="flex space-x-4 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="flex space-x-4 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-none w-[280px] h-[200px] bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const items = activeTab === 'events' ? events :
                 activeTab === 'opportunities' ? opportunities :
                 shops;

    if (items.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500">
          <div className="mb-2">
            {activeTab === 'events' ? (
              <Calendar className="w-8 h-8 mx-auto text-gray-400" />
            ) : activeTab === 'opportunities' ? (
              <Briefcase className="w-8 h-8 mx-auto text-gray-400" />
            ) : (
              <Store className="w-8 h-8 mx-auto text-gray-400" />
            )}
          </div>
          <p className="text-sm">
            {activeTab === 'events' ? 'Aucun événement' :
             activeTab === 'opportunities' ? 'Aucune opportunité' :
             'Aucune boutique'}
          </p>
        </div>
      );
    }

    return (
      <div className="flex space-x-3 overflow-x-auto hide-scrollbar pb-2">
        {items.map((item) => (
          activeTab === 'events' ? renderEventCard(item as EventItem) :
          activeTab === 'opportunities' ? renderOpportunityCard(item as OpportunityItem) :
          renderShopCard(item as ShopItem)
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Tabs */}
      <div className="flex space-x-2 p-2">
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as TabType)}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg text-sm transition-colors ${
              activeTab === id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{label} ({count})</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        
        {renderContent()}
      </div>
    </div>
  );
}