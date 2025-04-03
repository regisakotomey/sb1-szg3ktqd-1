'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import EventDetails from '@/components/events/EventDetails';
import MainLayout from '@/components/MainLayout';

export default function EventPage() {
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
      <EventDetails />
    </MainLayout>
  );
}