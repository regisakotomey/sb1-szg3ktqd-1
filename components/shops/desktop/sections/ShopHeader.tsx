'use client';

import { Store } from 'lucide-react';

interface ShopHeaderProps {
  name: string;
  logo?: string;
}

export default function ShopHeader({ name, logo }: ShopHeaderProps) {
  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden mb-6 relative">
      {logo ? (
        <img
          src={logo}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <Store size={64} className="text-gray-400" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
        <h1 className="text-3xl font-bold">{name}</h1>
      </div>
    </div>
  );
}