'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { getUserData } from '@/lib/storage';
import { Calendar, MapPin, Briefcase, Store, ShoppingBag, Heart, MessageSquare } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  type?: string;
  date?: string;
  price?: number;
  location?: string;
}

interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: string;
  country_code: string;
  sector?: string;
  followers: number;
  following: number;
  isFollowed: boolean;
}

type ContentType = 'posts' | 'events' | 'places' | 'opportunities' | 'shops';
type InteractionType = 'likes' | 'comments';

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  
  // Content state
  const [selectedContentType, setSelectedContentType] = useState<ContentType>('posts');
  const [selectedInteractionType, setSelectedInteractionType] = useState<InteractionType>('likes');
  const [content, setContent] = useState<Record<ContentType, ContentItem[]>>({
    posts: [],
    events: [],
    places: [],
    opportunities: [],
    shops: []
  });
  const [interactions, setInteractions] = useState<Record<InteractionType, ContentItem[]>>({
    likes: [],
    comments: []
  });
  const [contentPage, setContentPage] = useState(1);
  const [interactionsPage, setInteractionsPage] = useState(1);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const [hasMoreInteractions, setHasMoreInteractions] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const contentTypes = [
    { type: 'posts', label: 'Publications', icon: <MessageSquare size={20} /> },
    { type: 'events', label: 'Événements', icon: <Calendar size={20} /> },
    { type: 'places', label: 'Lieux', icon: <MapPin size={20} /> },
    { type: 'opportunities', label: 'Opportunités', icon: <Briefcase size={20} /> },
    { type: 'shops', label: 'Boutiques', icon: <Store size={20} /> }
  ];

  const interactionTypes = [
    { type: 'likes', label: 'J\'aime', icon: <Heart size={20} /> },
    { type: 'comments', label: 'Commentaires', icon: <MessageSquare size={20} /> }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = getUserData();
        const userId = params?.id || currentUser?.id;

        if (!userId) {
          throw new Error('Utilisateur non trouvé');
        }

        const response = await fetch(`/api/users/${userId}?currentUserId=${currentUser?.id || ''}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }

        const data = await response.json();
        setUserData(data);
        
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params?.id]);

  useEffect(() => {
    if (userData) {
      // Reset content state when user changes
      setContent({
        posts: [],
        events: [],
        places: [],
        opportunities: [],
        shops: []
      });
      setInteractions({
        likes: [],
        comments: []
      });
      setContentPage(1);
      setInteractionsPage(1);
      setHasMoreContent(true);
      setHasMoreInteractions(true);
      
      // Load initial content
      fetchContent(selectedContentType, 1);
      fetchInteractions(selectedInteractionType, 1);
    }
  }, [userData]); // S'exécute uniquement quand userData est mis à jour

  const fetchContent = async (type: ContentType, page: number) => {
    if (!userData) return;
    
    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/users/${userData.id}/content?type=${type}&page=${page}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch content');
      
      const data = await response.json();
      
      setContent(prev => ({
        ...prev,
        [type]: page === 1 ? data.items : [...prev[type], ...data.items]
      }));
      
      setHasMoreContent(data.hasMore);
      setContentPage(page);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const fetchInteractions = async (type: InteractionType, page: number) => {
    if (!userData) return;
    
    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/users/${userData.id}/interactions?type=${type}&page=${page}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch interactions');
      
      const data = await response.json();
      
      setInteractions(prev => ({
        ...prev,
        [type]: page === 1 ? data.items : [...prev[type], ...data.items]
      }));
      
      setHasMoreInteractions(data.hasMore);
      setInteractionsPage(page);
    } catch (error) {
      console.error('Error fetching interactions:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleContentTypeChange = (type: ContentType) => {
    setSelectedContentType(type);
    setContentPage(1);
    setHasMoreContent(true);
    fetchContent(type, 1);
  };

  const handleInteractionTypeChange = (type: InteractionType) => {
    setSelectedInteractionType(type);
    setInteractionsPage(1);
    setHasMoreInteractions(true);
    fetchInteractions(type, 1);
  };

  const loadMoreContent = () => {
    if (!isLoadingMore && hasMoreContent) {
      fetchContent(selectedContentType, contentPage + 1);
    }
  };

  const loadMoreInteractions = () => {
    if (!isLoadingMore && hasMoreInteractions) {
      fetchInteractions(selectedInteractionType, interactionsPage + 1);
    }
  };

  const contentObserver = useCallback(
    (node: HTMLDivElement) => {
      if (!node || !hasMoreContent || isLoadingMore) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMoreContent();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [hasMoreContent, isLoadingMore, selectedContentType, contentPage]
  );

  const interactionsObserver = useCallback(
    (node: HTMLDivElement) => {
      if (!node || !hasMoreInteractions || isLoadingMore) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMoreInteractions();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [hasMoreInteractions, isLoadingMore, selectedInteractionType, interactionsPage]
  );

  if (loading) {
    return (
      <main className="flex-1 pt-[76px] ml-[250px] p-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="animate-pulse">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-8">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !userData) {
    return (
      <main className="flex-1 pt-[76px] ml-[250px] p-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error || 'Utilisateur non trouvé'}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pt-[76px] p-6">
      <div className="max-w-[1200px] mx-auto">
        <ProfileHeader 
          user={{
            id: userData.id,
            name: `${userData.firstName} ${userData.lastName}`,
            avatar: userData.avatar,
            bio: userData.bio || '',
            location: userData.country_code,
            followers: userData.followers,
            following: userData.following,
            isFollowed: userData.isFollowed
          }}
          onSponsor={() => setShowSponsorModal(true)} 
        />

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Content Types */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Contenu</h2>
              </div>
              <div className="p-2">
                {contentTypes.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => handleContentTypeChange(type as ContentType)}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                      selectedContentType === type
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Interactions</h2>
              </div>
              <div className="p-2">
                {interactionTypes.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => handleInteractionTypeChange(type as InteractionType)}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                      selectedInteractionType === type
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Content Display */}
          <div className="col-span-9">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold">
                  {selectedContentType === 'posts' ? 'Publications' :
                   selectedContentType === 'events' ? 'Événements' :
                   selectedContentType === 'places' ? 'Lieux' :
                   selectedContentType === 'opportunities' ? 'Opportunités' :
                   'Boutiques'}
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  {content[selectedContentType].map((item, index) => (
                    <div
                      key={item.id}
                      ref={index === content[selectedContentType].length - 1 ? contentObserver : null}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        const route = selectedContentType === 'posts' ? '/' :
                                    selectedContentType === 'events' ? '/content/events/' :
                                    selectedContentType === 'places' ? '/content/places/' :
                                    selectedContentType === 'opportunities' ? '/content/opportunities/' :
                                    '/content/shops/';
                        router.push(`${route}${item.id}`);
                      }}
                    >
                      {item.image && (
                        <div className="aspect-video relative">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          {item.type && (
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                              {item.type}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          {item.date && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{item.date}</span>
                            </div>
                          )}
                          {item.location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{item.location}</span>
                            </div>
                          )}
                          {item.price && (
                            <div className="flex items-center gap-1">
                              <ShoppingBag size={14} />
                              <span>{item.price.toFixed(2)} €</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {isLoadingMore && (
                  <div className="mt-6 flex justify-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}