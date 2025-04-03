'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductHeaderProps {
  name: string;
  price: number;
  media: Array<{
    url: string;
    caption: string;
  }>;
  currentIndex: number;
  onChangeMedia: (index: number) => void;
}

export default function ProductHeader({
  name,
  price,
  media,
  currentIndex,
  onChangeMedia
}: ProductHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Main Media Display */}
      <div className="w-full h-[400px] rounded-xl overflow-hidden relative">
        <img
          src={media[currentIndex].url}
          alt={media[currentIndex].caption || name}
          className="w-full h-full object-cover"
        />

        {media.length > 1 && (
          <>
            <button
              onClick={() => onChangeMedia((currentIndex - 1 + media.length) % media.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => onChangeMedia((currentIndex + 1) % media.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{name}</h1>
          <div className="text-xl font-semibold text-white">
            {price.toFixed(2)} €
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="grid grid-cols-5 gap-4">
          {media.map((item, index) => (
            <div
              key={index}
              onClick={() => onChangeMedia(index)}
              className={`aspect-square rounded-lg overflow-hidden cursor-pointer ${
                index === currentIndex ? 'ring-2 ring-primary' : ''
              }`}
            >
              <img
                src={item.url}
                alt={item.caption || `${name} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}