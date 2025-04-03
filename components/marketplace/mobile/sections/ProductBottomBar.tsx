'use client';

import { ShoppingBag } from 'lucide-react';

interface ProductBottomBarProps {
  productId: string;
  isOwner: boolean;
  price: number;
}

export default function ProductBottomBar({
  productId,
  isOwner,
  price
}: ProductBottomBarProps) {
  if (isOwner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="text-xl font-semibold">
          {price.toFixed(2)} €
        </div>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white rounded-xl text-sm font-medium"
        >
          <ShoppingBag size={18} />
          <span>Commander</span>
        </button>
      </div>
    </div>
  );
}