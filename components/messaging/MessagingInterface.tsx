'use client';

import { useState, useEffect } from 'react';
import DesktopMessagingInterface from './desktop/MessagingInterface';
import MobileMessagingInterface from './mobile/MessagingInterface';

export default function MessagingInterface() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileMessagingInterface /> : <DesktopMessagingInterface />;
}