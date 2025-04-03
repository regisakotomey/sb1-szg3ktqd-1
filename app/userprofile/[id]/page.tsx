'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MainLayout from '@/components/MainLayout';
import Sidebar from '@/components/Sidebar';
import DesktopUserProfile from '@/components/userprofile/desktop/DesktopUserProfile';
import MobileUserProfile from '@/components/userprofile/mobile/MobileUserProfile';

export default function UserProfilePage() {
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
      {!isMobile && <Header />}
      {isMobile ? <MobileUserProfile /> : <DesktopUserProfile />}
    </MainLayout>
  );
}