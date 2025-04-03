'use client';

import { useEffect } from 'react';
import { Store, Globe, MapPin } from 'lucide-react';
import { Shop } from '@/types/shop';
import { getShopTypeLabel } from '@/lib/shop-types';
import { getUserData } from '@/lib/storage';

interface MobileShopsListProps {
  shops: Shop[];
  hasMore: boolean;
  onShopClick: (id: string) => void;
  lastShopRef?: (node: HTMLDivElement) => void;
}

function ShopCard({
  shop,
  onShopClick,
  lastShopRef,
}: {
  shop: Shop;
  onShopClick: (id: string) => void;
  lastShopRef?: (node: HTMLDivElement) => void;
}) {
  useEffect(() => {
    const recordView = async () => {
      const userData = getUserData();
      if (!userData?.id) return;

      try {
        await fetch(`/api/shops/${shop._id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.id }),
        });
      } catch (error) {
        console.error('Error recording view:', error);
      }
    };

    recordView();
  }, [shop._id]);

  return (
    <div
      ref={lastShopRef}
      onClick={() => onShopClick(shop._id)}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="aspect-[16/9] relative">
        {shop.logo ? (
          <img
            src={shop.logo}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Store size={48} className="text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {getShopTypeLabel(shop.type)}
        </div>
      </div>

      <div className="p-2">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {shop.name}
        </h3>

        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
          {shop.description}
        </p>
      </div>
    </div>
  );
}

export default function MobileShopsList({
  shops,
  hasMore,
  onShopClick,
  lastShopRef,
}: MobileShopsListProps) {
  return (
    <div className="h-screen overflow-y-auto">
      <main className="flex-1 pt-[60px] pb-[60px] mx-auto w-full max-w-[550px]">
        <h1 className="text-xl font-semibold p-3">Boutiques à découvrir</h1>

        {shops.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune boutique disponible pour le moment
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {shops.map((shop, index) => (
              <ShopCard
                key={shop._id}
                shop={shop}
                onShopClick={onShopClick}
                lastShopRef={index === shops.length - 1 ? lastShopRef : undefined}
              />
            ))}
            {lastShopRef && hasMore &&(
              <div className="p-4">
                <div className={`grid grid-cols-1 gap-4`}>
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                      <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}