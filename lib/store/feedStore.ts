'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Post } from '@/types/post';

interface FeedState {
  posts: Post[];
  events: any[];
  places: any[];
  opportunities: any[];
  products: any[];
  shops: any[];
  page: { current: number; total: number };
  horizontalPage: number;
  scrollPosition: number;
  setPosts: (posts: Post[]) => void;
  setEvents: (events: any[]) => void;
  setPlaces: (places: any[]) => void;
  setOpportunities: (opportunities: any[]) => void;
  setProducts: (products: any[]) => void;
  setShops: (shops: any[]) => void;
  setPage: (page: { current: number; total: number }) => void;
  setHorizontalPage: (page: number) => void;
  setScrollPosition: (position: number) => void;
  reset: () => void;
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set) => ({
      posts: [],
      events: [],
      places: [],
      opportunities: [],
      products: [],
      shops: [],
      page: { current: 1, total: 1 },
      horizontalPage: 1,
      scrollPosition: 0,
      setPosts: (posts) => set({ posts }),
      setEvents: (events) => set({ events }),
      setPlaces: (places) => set({ places }),
      setOpportunities: (opportunities) => set({ opportunities }),
      setProducts: (products) => set({ products }),
      setShops: (shops) => set({ shops }),
      setPage: (page) => set({ page }),
      setHorizontalPage: (horizontalPage) => set({ horizontalPage }),
      setScrollPosition: (scrollPosition) => set({ scrollPosition }),
      reset: () => set({
        posts: [],
        events: [],
        places: [],
        opportunities: [],
        products: [],
        shops: [],
        page: { current: 1, total: 1 },
        horizontalPage: 1,
        scrollPosition: 0
      })
    }),
    {
      name: 'feed-store'
    }
  )
);