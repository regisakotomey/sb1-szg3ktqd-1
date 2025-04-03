'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUserData } from '@/lib/storage';
import MobileProductView from './mobile/MobileProductView';
import DesktopProductView from './desktop/DesktopProductView';
import { Product } from '@/types/product';

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isShopFollowing, setIsShopFollowing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const userData = getUserData();
        const response = await fetch(`/api/products/get?id=${params.id}&currentUserId=${userData?.id || ''}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du produit');
        }
        const productData = await response.json();
        
        setProduct(productData);
        
        if (userData) {
          // Check if user is owner
          if (productData.userId === userData.id) {
            setIsOwner(true);
          }

          // Check if user is following the shop
          if (productData.shop) {
            setIsShopFollowing(productData.shop.isFollowed);
          }

          // Record view if not owner
          if (productData.userId !== userData.id) {
            await fetch(`/api/products/${productData._id}/view`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: userData.id })
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProductData();
    }
  }, [params.id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href
      });
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    try {
      const response = await fetch('/api/products/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          userId: getUserData()?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      router.push('/content/marketplace');
    } catch (err) {
      console.error('Error:', err);
      setError('Erreur lors de la suppression du produit');
    }
  };

  if (loading) {
    return (
      <main className={`flex-1 ${isMobile ? 'pt-0' : 'pt-[76px]'} mx-auto w-full max-w-[800px] transition-all`}>
        <div className="animate-pulse">
          <div className="w-full h-[300px] sm:h-[400px] bg-gray-200"></div>
          <div className="p-4 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className={`flex-1 ${isMobile ? 'pt-0' : 'pt-[76px]'} mx-auto w-full max-w-[800px] transition-all`}>
        <div className="p-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error || 'Produit non trouvé'}
          </div>
        </div>
      </main>
    );
  }

  return isMobile ? (
    <MobileProductView
      product={product}
      isOwner={isOwner}
      isShopFollowing={isShopFollowing}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onBack={() => router.back()}
      onShare={handleShare}
      onSponsor={() => {}}
      onEdit={() => {}}
      onDelete={handleDelete}
      onReport={() => {}}
      onToggleFollow={setIsShopFollowing}
    />
  ) : (
    <DesktopProductView
      product={product}
      isOwner={isOwner}
      isShopFollowing={isShopFollowing}
      currentMediaIndex={currentMediaIndex}
      onChangeMedia={setCurrentMediaIndex}
      onShare={handleShare}
      onSponsor={() => {}}
      onEdit={() => {}}
      onDelete={handleDelete}
      onReport={() => {}}
      onToggleFollow={setIsShopFollowing}
    />
  );
}