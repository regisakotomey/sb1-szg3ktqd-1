'use client';

import { useState, useEffect } from 'react';
import { Info, ImagePlus, Calendar, Briefcase, Store, Play, ChevronRight, MapPin, Phone, Mail, Globe, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PlaceHeader from './sections/PlaceHeader';
import PlaceActions from './sections/PlaceActions';
import PlaceStatistics from './sections/PlaceStatistics';
import PlaceOrganizer from './sections/PlaceOrganizer';
import PlaceDetails from './sections/PlaceDetails';
import PlaceGallery from './sections/PlaceGallery';
import PlaceComments from './sections/PlaceComments';
import PlaceCreationButtons from './sections/PlaceCreationButtons';
import PlaceBusinessHours from './sections/PlaceBusinessHours';
import EditPlaceForm from '@/components/forms/EditPlaceForm';
import { Place } from '@/types/place';
import { getUserData } from '@/lib/storage';
import PlaceAdSpots from './sections/PlaceAdSpots';
import { getEventTypeLabel } from '@/lib/event-types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getOpportunityTypeLabel } from '@/lib/opportunity-types';
import { getShopTypeLabel, getShopTypesByCategory } from '@/lib/shop-types';

interface DesktopPlaceViewProps {
  place: Place;
  isOwner: boolean;
  isPlaceFollowing: boolean;
  isOrganizerFollowing: boolean;
  onShare: () => void;
  onSponsor: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onToggleFollow: (newState: boolean) => void;
  onToggleOrganizerFollow: (newState: boolean) => void;
}

type NavigationItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
};

export default function DesktopPlaceView({
  place,
  isOwner,
  isPlaceFollowing,
  isOrganizerFollowing,
  onShare,
  onSponsor,
  onEdit,
  onDelete,
  onReport,
  onToggleFollow,
  onToggleOrganizerFollow
}: DesktopPlaceViewProps) {
  const router = useRouter();
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentPlace, setCurrentPlace] = useState(place);
  const [activeSection, setActiveSection] = useState('about');
  const [adSpots, setAdSpots] = useState([]);
  const [events, setEvents] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contentCounts, setContentCounts] = useState({
    events: 0,
    opportunities: 0,
    shops: 0
  });

  const [openingStatus, setOpeningStatus] = useState(getOpeningStatus(place.openingHours));

  const navigationItems: NavigationItem[] = [
    { id: 'about', label: 'À propos', icon: <Info size={20} /> },
    { id: 'events', label: 'Événements', icon: <Calendar size={20} />, count: contentCounts.events },
    { id: 'opportunities', label: 'Opportunités', icon: <Briefcase size={20} />, count: contentCounts.opportunities },
    { id: 'shops', label: 'Boutiques', icon: <Store size={20} />, count: contentCounts.shops },
  ];

  useEffect(() => {
    const fetchContentCounts = async () => {
      try {
        const [eventsRes, opportunitiesRes, shopsRes] = await Promise.all([
          fetch(`/api/events/get?placeId=${place._id}`),
          fetch(`/api/opportunities/get?placeId=${place._id}`),
          fetch(`/api/shops/get?placeId=${place._id}`)
        ]);

        const [eventsData, opportunitiesData, shopsData] = await Promise.all([
          eventsRes.json(),
          opportunitiesRes.json(),
          shopsRes.json()
        ]);

        setContentCounts({
          events: eventsData.pagination?.total || 0,
          opportunities: opportunitiesData.pagination?.total || 0,
          shops: shopsData.pagination?.total || 0
        });
      } catch (error) {
        console.error('Error fetching content counts:', error);
      }
    };

    fetchContentCounts();
  }, [place._id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpeningStatus(getOpeningStatus(currentPlace.openingHours));
    }, 60000);

    return () => clearInterval(interval);
  }, [currentPlace.openingHours]);

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleEditComplete = async () => {
    try {
      const userData = getUserData();
      const response = await fetch(`/api/places/get?id=${place._id}&currentUserId=${userData?.id || ''}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du lieu');
      }
      const updatedPlace = await response.json();
      setCurrentPlace(updatedPlace);
    } catch (error) {
      console.error('Error refreshing place data:', error);
    }
    setShowEditForm(false);
  };

  useEffect(() => {
    const fetchSectionData = async () => {
      setLoading(true);
      try {
        let response;
        switch (activeSection) {
          case 'ads':
            response = await fetch(`/api/ads/get?placeId=${place._id}`);
            if (response.ok) {
              const data = await response.json();
              setAdSpots(data.adSpots);
            }
            break;
          case 'events':
            response = await fetch(`/api/events/get?placeId=${place._id}`);
            if (response.ok) {
              const data = await response.json();
              setEvents(data.events);
            }
            break;
          case 'opportunities':
            response = await fetch(`/api/opportunities/get?placeId=${place._id}`);
            if (response.ok) {
              const data = await response.json();
              setOpportunities(data.opportunities);
            }
            break;
          case 'shops':
            response = await fetch(`/api/shops/get?placeId=${place._id}`);
            if (response.ok) {
              const data = await response.json();
              setShops(data.shops);
            }
            break;
        }
      } catch (error) {
        console.error('Error fetching section data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeSection !== 'about') {
      fetchSectionData();
    }
  }, [activeSection, place._id]);

  const renderContent = () => {
    switch (activeSection) {
      case 'about':
        return (
          <div className=" gap-6">
            <div className="space-y-6">
              <PlaceDetails place={currentPlace} />
              <PlaceBusinessHours openingHours={currentPlace.openingHours} />
              {currentPlace.additionalImages && currentPlace.additionalImages.length > 0 && (
                <PlaceGallery images={currentPlace.additionalImages} />
              )}
            </div>
            
          </div>
        );
      case 'events':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Événements</h2>
              
            </div>
            {loading ? (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {events.map((event: any) => (
                  <div
                    key={event._id}
                    onClick={() => router.push(`/content/events/${event._id}`)}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer">
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
                      <div className="flex items-center justify-center border border-gray-400 rounded px-2 py-1 text-sm text-gray-600">
                        <span className="text-center">{format(new Date(event.startDate), 'dd MMMM', { locale: fr })}</span>
                      </div>
              
                      <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                        {event.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun événement pour le moment
              </div>
            )}
          </div>
        );
      case 'opportunities':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Opportunités</h2>
              
            </div>
            {loading ? (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : opportunities.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {opportunities.map((opportunity: any) => (
                  <div
                    key={opportunity._id}
                    onClick={() => router.push(`/content/opportunities/${opportunity._id}`)}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer">
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
              
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {opportunity.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucune opportunité pour le moment
              </div>
            )}
          </div>
        );
      case 'shops':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Boutiques</h2>
              
            </div>
            {loading ? (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : shops.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {shops.map((shop: any) => (
                  <div
                    key={shop._id}
                    onClick={() => router.push(`/content/shops/${shop._id}`)}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <div className="aspect-video relative">
                      {shop.logo ? (
                        <img
                          src={shop.logo}
                          alt={shop.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Store size={48} className="text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {getShopTypeLabel(shop.type)}
                      </div>
                    </div>
              
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {shop.name}
                      </h3>
              
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {shop.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucune boutique pour le moment
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  function getOpeningStatus(openingHours: Place['openingHours']) {
    const now = new Date();
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const currentDay = days[now.getDay()];
    const currentTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  
    const todayHours = openingHours.find(day => day.day === currentDay);
    
    if (!todayHours || !todayHours.isOpen) {
      return { isOpen: false, message: 'Fermé' };
    }
  
    if (!todayHours.openTime || !todayHours.closeTime) {
      return { isOpen: true, message: 'Ouvert' };
    }
  
    const openTime = todayHours.openTime;
    const closeTime = todayHours.closeTime;
  
    if (currentTime >= openTime && currentTime <= closeTime) {
      return { 
        isOpen: true, 
        message: `Ouvert jusqu'à ${closeTime}` 
      };
    } else if (currentTime < openTime) {
      return { 
        isOpen: false, 
        message: `Ouvre à ${openTime}` 
      };
    } else {
      return { 
        isOpen: false, 
        message: 'Fermé' 
      };
    }
  }

  return (
    <>
      <main className="flex-1 pt-[76px] transition-all">
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <PlaceHeader
            type={currentPlace.type}
            name={currentPlace.name}
            mainImage={currentPlace.mainImage}
            logo={currentPlace.logo}
          />
        </div>

        <div className="w-full max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {isOwner ? (
                <>
                  <PlaceStatistics
                    placeId={currentPlace._id}
                    viewCount={currentPlace.views?.length || 0}
                    followCount={currentPlace.followers?.length || 0}
                    onSponsor={onSponsor}
                  />
                  <PlaceCreationButtons
                    placeId={currentPlace._id}
                  />
                </>
              ) : currentPlace.organizer && (
                <PlaceOrganizer
                  organizer={currentPlace.organizer}
                  isOwner={isOwner}
                  isFollowing={isOrganizerFollowing}
                  onFollow={() => onToggleOrganizerFollow(!isOrganizerFollowing)}
                />
              )}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Informations pratiques</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Localisation</h4>
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin size={18} className="flex-shrink-0 mt-1" />
                      <p>{currentPlace.locationDetails}</p>
                    </div>
                  </div>

                  {(currentPlace.contact.phone || currentPlace.contact.email || currentPlace.contact.website) && (
                    <div>
                      <h4 className="font-medium mb-2">Contact</h4>
                      <div className="space-y-2">
                        {currentPlace.contact.phone && (
                          <a 
                            href={`tel:${currentPlace.contact.phone}`}
                            className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
                          >
                            <Phone size={18} />
                            <span>{currentPlace.contact.phone}</span>
                          </a>
                        )}
                        {currentPlace.contact.email && (
                          <a 
                            href={`mailto:${currentPlace.contact.email}`}
                            className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
                          >
                            <Mail size={18} />
                            <span>{currentPlace.contact.email}</span>
                          </a>
                        )}
                        {currentPlace.contact.website && (
                          <a 
                            href={currentPlace.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
                          >
                            <Globe size={18} />
                            <span>{currentPlace.contact.website}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Horaires</h4>
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${
                      openingStatus.isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      <Clock size={18} />
                      <span className="font-medium">{openingStatus.message}</span>
                    </div>
                  </div>
                </div>
              </div>
              <PlaceComments placeId={currentPlace._id} />
            </div>

            <div className="col-span-12 lg:col-span-8 space-y-6">
              <PlaceActions
                placeId={currentPlace._id}
                isOwner={isOwner}
                isFollowing={isPlaceFollowing}
                onEdit={handleEdit}
                onDelete={onDelete}
                onReport={onReport}
                onShare={onShare}
                onToggleFollow={onToggleFollow}
              />

              <PlaceAdSpots 
                placeId={currentPlace._id}
                isOwner={isOwner}
              />

              <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex gap-4">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        activeSection === item.id
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {typeof item.count === 'number' && (
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          activeSection === item.id
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {renderContent()}
            </div>
          </div>
        </div>
      </main>

      {showEditForm && (
        <EditPlaceForm 
          place={currentPlace}
          onClose={handleEditComplete}
        />
      )}
    </>
  );
}