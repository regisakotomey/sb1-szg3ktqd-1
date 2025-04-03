'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/forms/mobile/ProductForm';

interface Product {
  _id: string;
  name: string;
  price: number;
  media: Array<{
    url: string;
    caption: string;
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
  const [showProductForm, setShowProductForm] = useState(false);
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
      if (!response.ok) throw new Error('Erreur lors de la récupération des produits');
      
      const data = await response.json();
      if (pageNum === 1) {
        setProducts(data.products);
      } else {
        setProducts(prev => [...prev, ...data.products]);
      }
      setHasMore(pageNum < data.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
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
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-2">
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
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <>
      {isOwner && (
        <button
          onClick={() => setShowProductForm(true)}
          className="w-full flex items-center justify-center gap-2 p-3 mb-4 bg-primary text-white rounded-lg"
        >
          <Plus size={18} />
          <span>Ajouter un article</span>
        </button>
      )}

      {products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Aucun article disponible</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {products.map((product, index) => (
              <div
                key={product._id}
                ref={index === products.length - 1 ? lastProductRef : undefined}
                onClick={() => router.push(`/content/marketplace/${product._id}`)}
                className="bg-white rounded-lg overflow-hidden shadow-sm"
              >
                <div className="aspect-square">
                  <img
                    src={product.media[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm font-semibold text-primary">
                    {product.price.toFixed(2)} €
                  </p>
                </div>
              </div>
            ))}
          </div>

          {isLoadingMore && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-2 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showProductForm && (
        <ProductForm
          shopId={shopId}
          onClose={() => setShowProductForm(false)}
        />
      )}
    </>
  );
}