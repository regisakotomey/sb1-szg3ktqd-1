'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useNavigationStore } from '@/lib/store/navigationStore';

export function useNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { previousPath, currentPath, setPaths } = useNavigationStore();

  useEffect(() => {
    if (pathname !== currentPath) {
      setPaths(pathname || '/');
    }
  }, [pathname, currentPath, setPaths]);

  const goBack = () => {
    if (previousPath) {
      router.push(previousPath);
    } else {
      router.push('/');
    }
  };

  return {
    goBack,
    previousPath,
    currentPath
  };
}