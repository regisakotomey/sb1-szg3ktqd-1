'use client';

import { 
  Search,
  MessageSquare,
  User,
  X,
  Bell,
  ChevronLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import { theme } from '@/lib/theme';

export default function Header() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSearchVisible(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Check authentication status
    const checkAuth = () => {
      const userData = getUserData();
      setIsAuthenticated(!!userData?.id && userData?.isVerified === true && userData?.isAnonymous === false);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      const userData = getUserData();
      if (!userData?.id) return;

      try {
        const response = await fetch(`/api/notifications/get?userId=${userData.id}`);
        if (!response.ok) throw new Error('Failed to fetch notifications');
        
        const data = await response.json();
        const unreadCount = data.notifications.filter((notif: any) => !notif.read).length;
        setUnreadNotifications(unreadCount);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (isAuthenticated) {
      fetchUnreadNotifications();
      // Rafraîchir le compteur toutes les minutes
      const interval = setInterval(fetchUnreadNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleProtectedRoute = (path: string) => {
    const userData = getUserData();
    if (!!userData?.id && userData?.isVerified === true && userData?.isAnonymous === false) {
      router.push(path);
    } else {
      router.push(isMobile ? '/auth/mobile/login' : '/auth/desktop/login');
    }
  };

  const handleLogin = () => {
    router.push(isMobile ? '/auth/mobile/login' : '/auth/desktop/login');
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/content/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleProfileClick = () => {
    const userData = getUserData();
    if (userData?.id) {
      router.push(`/userprofile/${userData.id}`);
    } else {
      router.push(isMobile ? '/auth/mobile/login' : '/auth/desktop/login');
    }
  };

  return (
    <header className="w-full h-[60px] bg-primary text-white fixed top-0 left-0 flex justify-between items-center px-1 shadow-sm z-[1000]">
      <div className="flex items-center gap-4">
        <div 
          onClick={() => router.push('/')} 
          className={`${isMobile ? 'text-base' : 'text-xl'} font-bold tracking-wide whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity`}
        >
          {theme.name}
        </div>
      </div>
      
      {(!isMobile || isSearchVisible) && (
        <div className={`${isMobile ? 'fixed left-0 right-0 top-[60px] bg-primary p-4 shadow-md border-t border-white/10' : 'relative flex-1 max-w-sm mx-12'}`}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={14} />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 rounded-full border-none bg-white/10 text-white placeholder:text-white/50 focus:bg-white/15 focus:ring-1 focus:ring-white/10 text-[13px] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      <nav className="flex items-center">
        {isMobile && (
          <button
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className="p-2 hover:bg-white/10 rounded-md transition-colors"
          >
            <Search size={18} />
          </button>
        )}

        {isAuthenticated ? (
          <ul className="flex items-center text-sm">
            <li>
              <button
                onClick={() => handleProtectedRoute('/messages')}
                className="p-2 hover:bg-white/10 rounded-md transition-colors"
              >
                <MessageSquare size={isMobile ? 18 : 22} />
              </button>
            </li>
            <li className="relative">
              <button
                onClick={() => handleProtectedRoute('/notifications')}
                className="p-2 hover:bg-white/10 rounded-md transition-colors"
              >
                <Bell size={isMobile ? 18 : 22} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1.5">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                onClick={handleProfileClick}
                className="p-2 hover:bg-white/10 rounded-md transition-colors"
              >
                <User size={isMobile ? 18 : 22} />
              </button>
            </li>
          </ul>
        ) : (
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium text-xs sm:text-sm"
          >
            Connexion
          </button>
        )}
      </nav>
    </header>
  );
}