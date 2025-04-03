'use client';

import React from 'react';
import { 
  FcHome,
  FcCalendar,
  FcGlobe,
  FcBriefcase,
  FcShop,
  FcShipped,
  FcAdvertising,
  FcSettings,
  FcQuestions,
  FcFeedback,
  FcMenu
} from 'react-icons/fc';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const menuItems = [
  { icon: <FcHome size={24} />, label: 'Accueil', shortLabel: 'Accueil', path: '/' },
  { icon: <FcCalendar size={24} />, label: 'Événements', shortLabel: 'Évén.', path: '/content/events' },
  { icon: <FcGlobe size={24} />, label: 'Lieux', shortLabel: 'Lieux', path: '/content/places' },
  { icon: <FcBriefcase size={24} />, label: 'Opportunités', shortLabel: 'Opp.', path: '/content/opportunities' },
  { icon: <FcShop size={24} />, label: 'Marketplace', shortLabel: 'Marché', path: '/content/marketplace' },
  { icon: <FcShipped size={24} />, label: 'Boutiques', shortLabel: 'Bout.', path: '/content/shops' },
  { icon: <FcAdvertising size={24} />, label: 'Spots publicitaires', shortLabel: 'Spots', path: '/content/ads' },
  { type: 'separator' },
  { icon: <FcSettings size={24} />, label: 'Paramètres', shortLabel: 'Param.', path: '/settings' },
  { icon: <FcQuestions size={24} />, label: 'Aide', shortLabel: 'Aide', path: '/help' },
  { icon: <FcFeedback size={24} />, label: 'Contactez-nous', shortLabel: 'Contact', path: '/contact' }
];

const mobileMenuItems = menuItems.slice(0, 5);
const moreMenuItems = menuItems.slice(5);

export default function Sidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
    setShowMoreMenu(false);
  };

  const renderIcon = (icon: React.ReactElement, size: number) => {
    return React.cloneElement(icon, { size });
  };

  const renderNavItem = (item: any) => {
    if (item.type === 'separator') {
      return (
        <div
          key={`separator-${Math.random()}`}
          className="h-px bg-gray-200 my-2"
        />
      );
    }

    return (
      <button
        key={item.path}
        onClick={() => handleNavigation(item.path)}
        className="flex items-center gap-4 w-full p-3 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <div className="w-5 h-5">
          {renderIcon(item.icon, isMobile ? 16 : 24)}
        </div>
        <span>{isMobile ? item.shortLabel : item.label}</span>
      </button>
    );
  };

  if (isMobile) {
    return (
      <>
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-1 py-1">
          <div className="flex justify-around items-center">
            {mobileMenuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="flex flex-col items-center gap-0.5 p-1.5 text-gray-700"
              >
                <div className="w-5 h-5">
                  {renderIcon(item.icon, 16)}
                </div>
                <span className="text-[10px]">{item.shortLabel}</span>
              </button>
            ))}
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="flex flex-col items-center gap-0.5 p-1.5 text-gray-700"
            >
              <div className="w-5 h-5">
                <FcMenu size={16} />
              </div>
              <span className="text-[10px]">Plus</span>
            </button>
          </div>
        </nav>

        {showMoreMenu && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-30" 
              onClick={() => setShowMoreMenu(false)} 
            />
            <div className="fixed bottom-[60px] left-0 right-0 bg-white rounded-t-2xl z-40 p-3">
              <div className="flex flex-col gap-1">
                {moreMenuItems.map((item) => renderNavItem(item))}
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <aside className="w-[250px] h-[calc(100vh-60px)] fixed top-[60px] left-0 py-6 px-4 z-30 overflow-y-auto">
      <nav className="space-y-1">
        {menuItems.map((item) => renderNavItem(item))}
      </nav>
    </aside>
  );
}