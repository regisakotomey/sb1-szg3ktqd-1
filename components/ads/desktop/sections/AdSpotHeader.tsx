'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdSpotHeaderProps {
  media: Array<{
    url: string;
    caption: string;
  }>;
  currentIndex: number;
  onChangeMedia: (index: number) => void;
}

export default function AdSpotHeader({
  media,
  currentIndex,
  onChangeMedia
}: AdSpotHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Main Media Display */}
      <div className="w-full h-[400px] rounded-xl overflow-hidden relative">
        {media[currentIndex].url.includes('.mp4') ? (
          <div className="relative w-full h-full">
            <video
              src={media[currentIndex].url}
              controls
              className="w-full h-full object-cover"
            />
            {media[currentIndex].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                <p className="text-white text-lg">{media[currentIndex].caption}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={media[currentIndex].url}
              alt={media[currentIndex].caption}
              className="w-full h-full object-cover"
            />
            {media[currentIndex].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                <p className="text-white text-lg">{media[currentIndex].caption}</p>
              </div>
            )}
          </div>
        )}

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
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="grid grid-cols-5 gap-4">
          {media.map((item, index) => (
            <div
              key={index}
              onClick={() => onChangeMedia(index)}
              className={`aspect-square rounded-lg overflow-hidden cursor-pointer relative ${
                index === currentIndex ? 'ring-2 ring-primary' : ''
              }`}
            >
              {item.url.includes('.mp4') ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover"
                />
              )}
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
                  <p className="text-white text-xs line-clamp-2">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}