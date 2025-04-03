'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ShopDetails from '@/components/shops/ShopDetails';
import MainLayout from '@/components/MainLayout';

export default function ShopPage() {
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
          <ShopDetails />
        </MainLayout>
      );
}