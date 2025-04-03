'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MobileProductsList from './mobile/MobileProductsList';
import DesktopProductsList from './desktop/DesktopProductsList';
import { Product } from '@/types/product';

export default function ProductsList() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchProducts = useCallback(async (pageNum = 1) => {
    try {
      const response = await fetch(`/api/products/get?page=${pageNum}&limit=6`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des produits');
      }
      const data = await response.json();
      
      if (pageNum === 1) {
        setProducts(data.products);
      } else {
        setProducts(prev => [...prev, ...data.products]);
      }
      
      setHasMore(pageNum < data.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const lastProductRef = useCallback(
    (node: HTMLDivElement) => {
      if (!node || !hasMore || isLoadingMore) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsLoadingMore(true);
            fetchProducts(page + 1);
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [fetchProducts, hasMore, isLoadingMore, page]
  );

  if (loading) {
    return (
      <main className="flex-1 pt-[76px] mx-auto w-full max-w-[550px] transition-all">
        <div className="p-4">
          <h1 className="text-xl font-semibold mb-6">Marketplace</h1>
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2'} gap-4`}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 pt-[76px] mx-auto w-full max-w-[550px] transition-all">
        <div className="p-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 mx-auto w-full max-w-[550px] transition-all">
      {isMobile ? (
        <MobileProductsList
          products={products}
          hasMore={hasMore}
          onProductClick={(id) => router.push(`/content/marketplace/${id}`)}
          lastProductRef={lastProductRef}
        />
      ) : (
        <DesktopProductsList
          products={products}
          onProductClick={(id) => router.push(`/content/marketplace/${id}`)}
          lastProductRef={lastProductRef}
        />
      )}

      {isLoadingMore && (
        <div className="p-4">
          <div className={`grid grid-cols-2 gap-4`}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}