'use client';

import { Store } from 'lucide-react';
import { Shop } from '@/types/shop';
import { getShopTypeLabel } from '@/lib/shop-types';

interface ShopHeaderProps {
  shop: Shop;
}

export default function ShopHeader({ shop }: ShopHeaderProps) {
  return (
    <div className="relative">
      {shop.logo ? (
        <img
          src={shop.logo}
          alt={shop.name}
          className="w-full h-[250px] object-cover"
        />
      ) : (
        <div className="w-full h-[250px] bg-gray-100 flex items-center justify-center">
          <Store size={64} className="text-gray-400" />
        </div>
      )}
      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {getShopTypeLabel(shop.type)}
      </div>
      
    </div>
  );
}