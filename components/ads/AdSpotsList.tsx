'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MobileAdSpotsList from './mobile/MobileAdSpotsList';
import DesktopAdSpotsList from './desktop/DesktopAdSpotsList';

export default function AdSpotsList() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <main className="flex-1 mx-auto w-full max-w-[550px] transition-all hide-scrollbar">
      {isMobile ? (
        <MobileAdSpotsList />
      ) : (
        <DesktopAdSpotsList />
      )}
    </main>
  );
}