'use client';

import { useState, useEffect } from 'react';
import DesktopNotificationsList from '@/components/notifications/desktop/NotificationsList';
import MobileNotificationsList from '@/components/notifications/mobile/NotificationsList';

export default function NotificationsPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileNotificationsList /> : <DesktopNotificationsList />;
}