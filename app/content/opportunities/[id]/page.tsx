'use client';

import Header from '@/components/Header';
import OpportunityDetails from '@/components/opportunities/OpportunityDetails';
import MainLayout from '@/components/MainLayout';
import { useState, useEffect } from 'react';

export default function OpportunityPage() {
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
      <OpportunityDetails />
    </MainLayout>
  );
}