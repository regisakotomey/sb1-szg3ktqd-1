'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';
import AdSpotsList from '@/components/ads/AdSpotsList';
import MainLayout from '@/components/MainLayout';

export default function AdsPage() {
  return (
    <MainLayout>
      <Header />
      <Sidebar />
      <AdSpotsList />
      <RightSidebar />
    </MainLayout>
  );
}