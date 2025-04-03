import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import { Calendar, MapPin, Briefcase, Store, ShoppingBag, Heart, MessageSquare, Bell, User, ChevronLeft } from 'lucide-react';

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

interface Follower {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  isFollowing: boolean;
  followedAt: string;
}

type ContentType = 'posts' | 'events' | 'places' | 'opportunities' | 'shops';
type InteractionType = 'likes' | 'comments';

export default function MobileUserProfile() {
  const params = useParams();
  const router = useRouter();
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [followerPage, setFollowerPage] = useState(1);
  const [hasMoreFollowers, setHasMoreFollowers] = useState(true);
  
  // Content state
  const [selectedContentType, setSelectedContentType] = useState<ContentType>('posts');
  const [content, setContent] = useState<Record<ContentType, ContentItem[]>>({
    posts: [],
    events: [],
    places: [],
    opportunities: [],
    shops: []
  });
  const [contentPage, setContentPage] = useState(1);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const contentTypes = [
    { type: 'posts', label: 'Posts', icon: <MessageSquare size={20} /> },
    { type: 'events', label: 'Évén.', icon: <Calendar size={20} /> },
    { type: 'places', label: 'Lieux', icon: <MapPin size={20} /> },
    { type: 'opportunities', label: 'Opp.', icon: <Briefcase size={20} /> },
    { type: 'shops', label: 'Bout.', icon: <Store size={20} /> }
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
        
        // Load initial content
        if (data.id) {
          fetchContent(selectedContentType, 1);
          fetchFollowers(1);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params?.id]);

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
      
      setHasMoreContent(data.pagination.hasMore);
      setContentPage(page);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const fetchFollowers = async (page: number) => {
    if (!userData) return;
    
    setLoadingFollowers(true);
    try {
      const response = await fetch(`/api/users/${userData.id}/followers?page=${page}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch followers');
      
      const data = await response.json();
      
      setFollowers(prev => 
        page === 1 ? data.followers : [...prev, ...data.followers]
      );
      setHasMoreFollowers(data.pagination.hasMore);
      setFollowerPage(page);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const handleContentTypeChange = (type: ContentType) => {
    setSelectedContentType(type);
    setContentPage(1);
    setHasMoreContent(true);
    fetchContent(type, 1);
  };

  const loadMoreContent = () => {
    if (!isLoadingMore && hasMoreContent) {
      fetchContent(selectedContentType, contentPage + 1);
    }
  };

  const loadMoreFollowers = () => {
    if (!loadingFollowers && hasMoreFollowers) {
      fetchFollowers(followerPage + 1);
    }
  };

  const handleFollow = async (followerId: string) => {
    const currentUser = getUserData();
    if (!currentUser?.id) {
      router.push('/auth/mobile/login');
      return;
    }

    try {
      const response = await fetch(`/api/users/${followerId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (!response.ok) throw new Error('Failed to follow user');

      // Update followers list
      setFollowers(prev => prev.map(follower => 
        follower.id === followerId 
          ? { ...follower, isFollowing: !follower.isFollowing }
          : follower
      ));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleMessage = (userId: string) => {
    router.push(`/messages?userId=${userId}`);
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

  const followersObserver = useCallback(
    (node: HTMLDivElement) => {
      if (!node || !hasMoreFollowers || loadingFollowers) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMoreFollowers();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [hasMoreFollowers, loadingFollowers, followerPage]
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error || 'Utilisateur non trouvé'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        {/* Cover Image */}
        <div className="relative h-32 bg-gradient-to-r from-primary to-primary-hover">
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 p-2 bg-white/20 rounded-full text-white backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Profile Info */}
        <div className="relative px-4 pb-4">
          {/* Avatar */}
          <div className="absolute -top-16 left-4">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
              {userData.avatar ? (
                <img
                  src={userData.avatar}
                  alt={`${userData.firstName} ${userData.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <User size={32} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="pt-16">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold">
                  {userData.firstName} {userData.lastName}
                </h1>
                {userData.bio && (
                  <p className="text-gray-600 text-sm mt-1">{userData.bio}</p>
                )}
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => setShowFollowersModal(true)}
                    className="text-sm"
                  >
                    <span className="font-semibold">{userData.followers}</span>
                    <span className="text-gray-500 ml-1">abonnés</span>
                  </button>
                  <span className="text-sm">
                    <span className="font-semibold">{userData.following}</span>
                    <span className="text-gray-500 ml-1">abonnements</span>
                  </span>
                </div>
              </div>

              {params?.id && params.id !== getUserData()?.id && (
                <div className="flex gap-2">
                  {userData.isFollowed ? (
                    <button
                      onClick={() => handleMessage(userData.id)}
                      className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                    >
                      <MessageSquare size={16} />
                      <span>Message</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollow(userData.id)}
                      className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                    >
                      <Bell size={16} />
                      <span>Suivre</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Navigation */}
        <div className="border-t border-gray-200">
          <div className="flex overflow-x-auto hide-scrollbar">
            {contentTypes.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => handleContentTypeChange(type as ContentType)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 min-w-[72px] text-xs font-medium border-b-2 transition-colors ${
                  selectedContentType === type
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600'
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-3">
          {content[selectedContentType].map((item, index) => (
            <div
              key={item.id}
              ref={index === content[selectedContentType].length - 1 ? contentObserver : null}
              onClick={() => {
                const route = selectedContentType === 'posts' ? '/' :
                            selectedContentType === 'events' ? '/content/events/' :
                            selectedContentType === 'places' ? '/content/places/' :
                            selectedContentType === 'opportunities' ? '/content/opportunities/' :
                            '/content/shops/';
                router.push(`${route}${item.id}`);
              }}
              className="bg-white rounded-lg overflow-hidden shadow-sm"
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
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 mb-1">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {item.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  {item.date && (
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {item.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}
                  {item.price && (
                    <div className="flex items-center gap-1">
                      <ShoppingBag size={12} />
                      <span>{item.price.toFixed(2)} €</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isLoadingMore && (
          <div className="mt-4 flex justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-white z-50">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Abonnés</h2>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {followers.map((follower, index) => (
                  <div
                    key={follower.id}
                    ref={index === followers.length - 1 ? followersObserver : null}
                    className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        {follower.avatar ? (
                          <img
                            src={follower.avatar}
                            alt={follower.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{follower.name}</h3>
                        {follower.bio && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {follower.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    {follower.isFollowing ? (
                      <button
                        onClick={() => handleMessage(follower.id)}
                        className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                      >
                        <MessageSquare size={14} />
                        <span>Message</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollow(follower.id)}
                        className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                      >
                        <Bell size={14} />
                        <span>Suivre</span>
                      </button>
                    )}
                  </div>
                ))}

                {loadingFollowers && (
                  <div className="flex justify-center py-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}