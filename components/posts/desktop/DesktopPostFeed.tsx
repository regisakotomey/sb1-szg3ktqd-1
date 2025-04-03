'use client';

import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import PostCard from './sections/PostCard';
import HorizontalList from './sections/HorizontalList';
import AdSpots from './sections/AdSpots';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import { fetchEvents } from '@/lib/api/fetchEvents';
import { fetchPlaces } from '@/lib/api/fetchPlaces';
import { fetchOpportunities } from '@/lib/api/fetchOpportunities';
import { fetchProducts } from '@/lib/api/fetchProducts';
import { fetchShops } from '@/lib/api/fetchShops';
import { Post } from '@/types/post';
import { useNavigation } from '@/hooks/useNavigation';
import { useFeedStore } from '@/lib/store/feedStore';

const POSTS_PER_BATCH = 4;
const SCROLL_POSITION_KEY = 'feed_scroll_position';

export default function DesktopPostFeed() {
  const router = useRouter();
  const { goBack } = useNavigation();
  const feedRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Use Zustand store
  const {
    posts,
    events,
    places,
    opportunities,
    products,
    shops,
    page,
    horizontalPage,
    scrollPosition,
    setPosts,
    setEvents,
    setPlaces,
    setOpportunities,
    setProducts,
    setShops,
    setPage,
    setHorizontalPage,
    setScrollPosition
  } = useFeedStore();

  const saveScrollPosition = useCallback(() => {
    if (feedRef.current) {
      const position = window.scrollY;
      setScrollPosition(position);
    }
  }, [setScrollPosition]);

  const restoreScrollPosition = useCallback(() => {
    if (scrollPosition > 0) {
      window.scrollTo(0, scrollPosition);
    }
  }, [scrollPosition]);

  const handleItemClick = (type: string, id: string) => {
    saveScrollPosition();
    router.push(`/content/${type}/${id}`);
  };

  const handlePostUpdate = (updatedPost: any) => {
    setPosts(
      posts.map((post) =>
        post._id === updatedPost.postId ? { ...post, ...updatedPost } : post
      )
    );
  };

  const handlePostDelete = (postId: string) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  useEffect(() => {
    const handlePostDeleted = (event: CustomEvent) => {
      const postId = event.detail;
      handlePostDelete(postId);
    };

    window.addEventListener('postDeleted', handlePostDeleted as EventListener);
    return () => {
      window.removeEventListener('postDeleted', handlePostDeleted as EventListener);
    };
  }, [posts]);

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      const userData = getUserData();
      const response = await fetch(
        `/api/posts/get?currentUserId=${userData?.id || ''}&page=${pageNum}&limit=${POSTS_PER_BATCH}`
      );
      if (!response.ok) throw new Error('Erreur lors de la récupération des posts');

      const data = await response.json();
      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts([...posts, ...data.posts]);
      }
      setPage({ current: pageNum, total: data.pagination.pages });
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [posts, setPosts, setPage]);

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || page.current >= page.total) return;

    setIsLoadingMore(true);
    await fetchPosts(page.current + 1);
  }, [isLoadingMore, page.current, page.total, fetchPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && page.current < page.total) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMorePosts, isLoadingMore, page.current, page.total]);

  useEffect(() => {
    const loadInitialData = async () => {
      // Only load initial data if the store is empty
      if (posts.length === 0) {
        try {
          await Promise.all([
            fetchPosts(1),
            loadHorizontalContent(1)
          ]);
        } catch (error) {
          console.error('Error loading initial data:', error);
          setError('Une erreur est survenue lors du chargement des données');
        }
      } else {
        setLoading(false);
        restoreScrollPosition();
      }
    };

    loadInitialData();

    const handlePostCreated = () => {
      fetchPosts(1);
    };

    window.addEventListener('postCreated', handlePostCreated);
    return () => window.removeEventListener('postCreated', handlePostCreated);
  }, []);

  const loadHorizontalContent = async (page: number) => {
    try {
      const [
        eventsData,
        placesData,
        opportunitiesData,
        productsData,
        shopsData
      ] = await Promise.all([
        fetchEvents(page),
        fetchPlaces(page),
        fetchOpportunities(page),
        fetchProducts(page),
        fetchShops(page)
      ]);

      setEvents(eventsData);
      setPlaces(placesData);
      setOpportunities(opportunitiesData);
      setProducts(productsData);
      setShops(shopsData);
    } catch (error) {
      console.error('Error loading horizontal content:', error);
    }
  };

  const getInterstitialContent = (index: number) => {
    const position = Math.floor(index / POSTS_PER_BATCH);
    const cycle = Math.floor(position / 5);

    if (position > 0 && position % 5 === 0 && cycle >= horizontalPage) {
      setHorizontalPage(horizontalPage + 1);
      loadHorizontalContent(horizontalPage + 1);
    }

    switch (position % 5) {
      case 0:
        return (
          <HorizontalList
            title="Événements à venir"
            items={events}
            onItemClick={(id) => handleItemClick('events', id)}
            emptyMessage="Aucun événement disponible"
          />
        );
      case 1:
        return (
          <HorizontalList
            title="Lieux à découvrir"
            items={places}
            onItemClick={(id) => handleItemClick('places', id)}
            emptyMessage="Aucun lieu disponible"
          />
        );
      case 2:
        return (
          <HorizontalList
            title="Opportunités"
            items={opportunities}
            onItemClick={(id) => handleItemClick('opportunities', id)}
            emptyMessage="Aucune opportunité disponible"
          />
        );
      case 3:
        return (
          <HorizontalList
            title="Produits"
            items={products}
            onItemClick={(id) => handleItemClick('marketplace', id)}
            emptyMessage="Aucun produit disponible"
          />
        );
      case 4:
        return (
          <HorizontalList
            title="Boutiques"
            items={shops}
            onItemClick={(id) => handleItemClick('shops', id)}
            emptyMessage="Aucune boutique disponible"
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 h-[300px] overflow-hidden">
        <div className="bg-white rounded-xl p-4 animate-pulse h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/5" />
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
          <div className="flex justify-between">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-4" ref={feedRef}>
      {/* Ad Spots Section */}
      <AdSpots />

      {/* Posts and Interstitial Content */}
      {posts.map((post, index) => (
        <React.Fragment key={post._id}>
          <PostCard
            post={post}
            onPostUpdate={handlePostUpdate}
          />
          {(index + 1) % POSTS_PER_BATCH === 0 && getInterstitialContent(index)}
        </React.Fragment>
      ))}

      {page.current < page.total && (
        <div ref={observerTarget} className="space-y-4 h-[300px] overflow-hidden">
          {isLoadingMore && (
            <div className="bg-white rounded-xl p-4 animate-pulse h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/5" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
              <div className="flex justify-between">
                <div className="h-8 bg-gray-200 rounded w-1/4" />
                <div className="h-8 bg-gray-200 rounded w-1/4" />
                <div className="h-8 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}