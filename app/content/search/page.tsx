'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DesktopSearch from '@/components/search/desktop/DesktopSearch';
import MobileSearch from '@/components/search/mobile/MobileSearch';
import MainLayout from '@/components/MainLayout';
import Header from '@/components/Header';

export default function SearchPage() {
  const [isMobile, setIsMobile] = useState(false);
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

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
        {isMobile ? <MobileSearch initialQuery={query} /> : <DesktopSearch initialQuery={query} />}
      </MainLayout>
    );

}