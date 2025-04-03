'use client';

import { useState, useEffect, useCallback } from 'react';
import MobileEventsList from './mobile/MobileEventsList';
import DesktopEventsList from './desktop/DesktopEventsList';

export default function EventsList() {
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
        <MobileEventsList/>
      ) : (
        <DesktopEventsList/>
      )}
    </main>
  );
}
