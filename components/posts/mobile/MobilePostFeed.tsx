'use client';

import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import PostCard from './sections/PostCard';
import HorizontalList from './sections/HorizontalList';
import AdsSpots from './sections/AdsSpots';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import { fetchEvents } from '@/lib/api/fetchEvents';
import { fetchPlaces } from '@/lib/api/fetchPlaces';
import { fetchOpportunities } from '@/lib/api/fetchOpportunities';
import { fetchProducts } from '@/lib/api/fetchProducts';
import { fetchShops } from '@/lib/api/fetchShops';
import { Post } from '@/types/post';
import { useFeedStore } from '@/lib/store/feedStore';

const POSTS_PER_BATCH = 4;

export default function MobilePostFeed() {
  const router = useRouter();
  const feedRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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
      const position = feedRef.current.scrollTop;
      setScrollPosition(position);
    }
  }, [setScrollPosition]);

  const restoreScrollPosition = useCallback(() => {
    if (feedRef.current && scrollPosition > 0) {
      feedRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

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
    const loadInitialData = async () => {
      if (posts.length === 0) {
        try {
          const [
            eventsData,
            placesData,
            opportunitiesData,
            productsData,
            shopsData
          ] = await Promise.all([
            fetchEvents(),
            fetchPlaces(),
            fetchOpportunities(),
            fetchProducts(),
            fetchShops()
          ]);

          setEvents(eventsData);
          setPlaces(placesData);
          setOpportunities(opportunitiesData);
          setProducts(productsData);
          setShops(shopsData);

          await fetchPosts(1);
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

  useEffect(() => {
    const feedElement = feedRef.current;
    if (!feedElement) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = feedElement;
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        loadMorePosts();
      }
      saveScrollPosition();
    };

    feedElement.addEventListener('scroll', handleScroll);
    return () => feedElement.removeEventListener('scroll', handleScroll);
  }, [loadMorePosts, saveScrollPosition]);

  const getInterstitialContent = (index: number) => {
    const position = Math.floor(index / POSTS_PER_BATCH);
    switch (position % 5) {
      case 0:
        return (
          <HorizontalList
            title="Événements à venir"
            items={events}
            onItemClick={(id) => router.push(`/content/events/${id}`)}
            emptyMessage="Aucun événement disponible"
          />
        );
      case 1:
        return (
          <HorizontalList
            title="Lieux à découvrir"
            items={places}
            onItemClick={(id) => router.push(`/content/places/${id}`)}
            emptyMessage="Aucun lieu disponible"
          />
        );
      case 2:
        return (
          <HorizontalList
            title="Opportunités"
            items={opportunities}
            onItemClick={(id) => router.push(`/content/opportunities/${id}`)}
            emptyMessage="Aucune opportunité disponible"
          />
        );
      case 3:
        return (
          <HorizontalList
            title="Produits"
            items={products}
            onItemClick={(id) => router.push(`/content/marketplace/${id}`)}
            emptyMessage="Aucun produit disponible"
          />
        );
      case 4:
        return (
          <HorizontalList
            title="Boutiques"
            items={shops}
            onItemClick={(id) => router.push(`/content/shops/${id}`)}
            emptyMessage="Aucune boutique disponible"
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-3 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/5" />
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
            <div className="flex justify-between">
              <div className="h-8 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-[calc(100vh-120px)] pb-[64px] overflow-y-auto hide-scrollbar"
      ref={feedRef}
    >
      {/* Ad Spots Section */}
      <AdsSpots />

      <div className="space-y-3 pb-4">
        {posts.map((post, index) => (
          <div key={post._id}>
            <PostCard
              post={post}
              onPostUpdate={(updatedPost: any) => {
                setPosts((prevPosts) =>
                  prevPosts.map((post) =>
                    post._id === updatedPost.postId ? { ...post, ...updatedPost } : post
                  )
                );
              }}
            />
            {(index + 1) % POSTS_PER_BATCH === 0 && getInterstitialContent(index)}
          </div>
        ))}

        {page.current < page.total && (
          <div className="space-y-4 h-[200px] overflow-hidden">
            {isLoadingMore && (
              <div className="bg-white p-4 animate-pulse h-full">
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
    </div>
  );
}