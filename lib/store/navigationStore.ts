'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  previousPath: string;
  currentPath: string;
  setPaths: (current: string) => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      previousPath: '/',
      currentPath: '/',
      setPaths: (current) => 
        set((state) => ({
          previousPath: state.currentPath,
          currentPath: current,
        })),
    }),
    {
      name: 'navigation-store',
    }
  )
);