'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  price: number;
  media: Array<{
    url: string;
  }>;
}

interface ShopProductsProps {
  shopId: string;
  isOwner: boolean;
}

export default function ShopProducts({ shopId, isOwner }: ShopProductsProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchProducts = useCallback(async (pageNum: number) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await fetch(`/api/products/get?shopId=${shopId}&page=${pageNum}&limit=8`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      if (pageNum === 1) {
        setProducts(data.products);
      } else {
        setProducts(prev => [...prev, ...data.products]);
      }
      setHasMore(pageNum < data.pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const lastProductRef = useCallback(
    (node: HTMLDivElement) => {
      if (!node || !hasMore || isLoadingMore) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
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
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <ShoppingBag size={24} className="text-gray-500" />
            <h2 className="text-xl font-bold">Articles</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <ShoppingBag size={24} className="text-gray-500" />
          <h2 className="text-xl font-bold">Articles</h2>
        </div>
        {isOwner && (
          <button
            onClick={() => router.push(`/content/shops/${shopId}/products/add`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus size={18} />
            <span>Ajouter un article</span>
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun article n'est disponible
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div
                key={product._id}
                ref={index === products.length - 1 ? lastProductRef : null}
                onClick={() => router.push(`/content/marketplace/${product._id}`)}
                className="cursor-pointer group bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
              >
                <div className="aspect-square rounded-t-xl overflow-hidden">
                  <img
                    src={product.media[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-primary font-bold text-sm">
                    {product.price.toFixed(2)} €
                  </p>
                </div>
              </div>
            ))}
          </div>

          {isLoadingMore && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}