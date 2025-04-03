'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserData } from '@/lib/storage';

// Les pages publiques qui ne nécessitent pas d'authentification
const publicPaths = [
  '/auth',
  '/auth/login',
  '/auth/register',
  '/auth/verify',
  '/auth/recover-password',
  '/events',
  '/places',
  '/shops',
  '/opportunities',
  '/marketplace',
  '/'
];

export function useAuthCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const userData = getUserData();
      const isValid = !!userData?.id && userData?.isVerified === true && userData?.isAnonymous === false;
      setIsAuthenticated(isValid);
      setIsLoading(false);

      // Ne vérifier l'authentification que pour les routes protégées
      const isPublicPath = publicPaths.some(path => pathname?.startsWith(path));
      if (!isPublicPath && !isValid) {
        router.push('/auth/login');
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [router, pathname]);

  return { isAuthenticated, isLoading };
}