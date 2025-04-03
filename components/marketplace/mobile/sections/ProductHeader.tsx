'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  name: string;
  price: number;
  media: Array<{
    url: string;
    caption: string;
  }>;
}

interface ProductHeaderProps {
  product: Product;
}

export default function ProductHeader({ product }: ProductHeaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="relative">
      <div className="relative">
        <img
          src={product.media[currentIndex].url}
          alt={product.name}
          className="w-full h-[50vh] object-cover"
        />

        {product.media.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + product.media.length) % product.media.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % product.media.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      <div className="p-4 bg-white">
        <h2 className="text-lg font-semibold leading-tight mb-2">
          {product.name}
        </h2>
        <div className="text-xl font-semibold text-primary">
          {product.price.toFixed(2)} €
        </div>
      </div>
    </div>
  );
}