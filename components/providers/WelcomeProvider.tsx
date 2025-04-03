'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import DesktopWelcomeDialog from '@/components/welcome/DesktopWelcomeDialog';
import MobileWelcomeDialog from '@/components/welcome/MobileWelcomeDialog';
import { hasUserData } from '@/lib/storage';

interface WelcomeContextType {
  showWelcome: boolean;
  hideWelcome: () => void;
}

const WelcomeContext = createContext<WelcomeContextType>({
  showWelcome: false,
  hideWelcome: () => {},
});

export function WelcomeProvider({ children }: { children: React.ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if it's the first visit
    if (!hasUserData()) {
      setShowWelcome(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mounted]);

  const hideWelcome = () => {
    setShowWelcome(false);
  };

  return (
    <WelcomeContext.Provider value={{ showWelcome, hideWelcome }}>
      {children}
      {mounted && showWelcome && (
        isMobile ? (
          <MobileWelcomeDialog onComplete={hideWelcome} />
        ) : (
          <DesktopWelcomeDialog onComplete={hideWelcome} />
        )
      )}
    </WelcomeContext.Provider>
  );
}

export function useWelcome() {
  return useContext(WelcomeContext);
}