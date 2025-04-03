'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PlaceDetails from '@/components/places/PlaceDetails';
import MainLayout from '@/components/MainLayout';

// This is required for static site generation with dynamic routes
export default function PlacePage() {
  const [isMobile, setIsMobile] = useState(false);
    
      useEffect(() => {
        const handleResize = () => {
          setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }, []);
    return (
      <MainLayout>
        {isMobile ? "" : <Header />}
        <PlaceDetails />
      </MainLayout>
    );
}