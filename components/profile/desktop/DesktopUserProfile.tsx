'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ContentNavigation from './sections/ContentNavigation';
import FollowersList from './sections/FollowersList';
import ContentGrid from './sections/ContentGrid';
import FollowersModal from './sections/FollowersModal';
import { ContentType, UserProfileData, Follower, ContentItem } from './sections/types';

export default function DesktopUserProfile() {
  const params = useParams();
  const router = useRouter();
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [followerPage, setFollowerPage] = useState(1);
  const [hasMoreFollowers, setHasMoreFollowers] = useState(true);
  
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

  const handleFollow = async (followerId: string) => {
    const currentUser = getUserData();
    if (!currentUser?.id) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`/api/users/${followerId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (!response.ok) throw new Error('Failed to follow user');

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
            fetchContent(selectedContentType, contentPage + 1);
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
            fetchFollowers(followerPage + 1);
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
      <div className="flex-1 p-6">
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
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error || 'Utilisateur non trouvé'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
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

        <div className="grid grid-cols-12 gap-6 mt-6">
          {/* Left Column - Navigation */}
          <div className="col-span-3">
            <ContentNavigation
              selectedType={selectedContentType}
              onTypeChange={handleContentTypeChange}
            />

            <FollowersList
              followers={followers}
              onShowAllClick={() => setShowFollowersModal(true)}
              onFollowClick={handleFollow}
              onMessageClick={handleMessage}
            />
          </div>

          {/* Right Column - Content Display */}
          <div className="col-span-9">
            <ContentGrid
              items={content[selectedContentType]}
              type={selectedContentType}
              onItemClick={(id) => {
                const route = selectedContentType === 'posts' ? '/' :
                            selectedContentType === 'events' ? '/content/events/' :
                            selectedContentType === 'places' ? '/content/places/' :
                            selectedContentType === 'opportunities' ? '/content/opportunities/' :
                            '/content/shops/';
                router.push(`${route}${id}`);
              }}
              lastItemRef={contentObserver}
              isLoadingMore={isLoadingMore}
            />
          </div>
        </div>

        <FollowersModal
          isOpen={showFollowersModal}
          followers={followers}
          onClose={() => setShowFollowersModal(false)}
          onFollowClick={handleFollow}
          onMessageClick={handleMessage}
          lastFollowerRef={followersObserver}
          isLoadingMore={loadingFollowers}
        />
      </div>
    </div>
  );
}