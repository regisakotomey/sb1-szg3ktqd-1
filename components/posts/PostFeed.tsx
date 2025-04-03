'use client';

import { useState, useEffect } from 'react';
import DesktopPostFeed from './desktop/DesktopPostFeed';
import MobilePostFeed from './mobile/MobilePostFeed';

export default function PostFeed() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobilePostFeed /> : <DesktopPostFeed />;
}