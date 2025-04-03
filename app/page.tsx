'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';
import MainColumn from '@/components/MainColumn';
import DesktopCreatePost from '@/components/DesktopCreatePost';
import MobileCreatePost from '@/components/MobileCreatePost';
import PostFeed from '@/components/posts/PostFeed';
import MainLayout from '@/components/MainLayout';

export default function Home() {
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
      <Header />
      <Sidebar />
      <MainColumn>
        {isMobile ? <MobileCreatePost /> : <DesktopCreatePost />}
        <PostFeed />
      </MainColumn>
      <RightSidebar />
    </MainLayout>
  );
}