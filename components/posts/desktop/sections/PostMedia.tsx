'use client';

import { useState } from 'react';
import ImageViewer from '@/components/ui/ImageViewer';

interface PostMediaProps {
  media: string[];
}

export default function PostMedia({ media }: PostMediaProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (media.length === 0) return null;

  return (
    <>
      <div className="grid gap-1 mb-3">
        {media.length === 1 && (
          <div
            className="relative w-full aspect-square"
            onClick={() => setSelectedImage(media[0])}
          >
            <img
              src={media[0]}
              alt="Media 1"
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        )}

        {media.length === 2 && (
          <div className="grid grid-cols-2 gap-1">
            {media.slice(0, 2).map((url, index) => (
              <div
                key={index}
                className="relative aspect-square"
                onClick={() => setSelectedImage(url)}
              >
                <img
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            ))}
          </div>
        )}

        {media.length === 3 && (
          <div className="grid grid-cols-2 gap-1">
            <div
              className="relative col-span-1"
              onClick={() => setSelectedImage(media[0])}
            >
              <img
                src={media[0]}
                alt="Media 1"
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="grid grid-rows-2 gap-1">
              {media.slice(1, 3).map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square"
                  onClick={() => setSelectedImage(url)}
                >
                  <img
                    src={url}
                    alt={`Media ${index + 2}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {media.length >= 4 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-1">
            {media.slice(0, 4).map((url, index) => (
              <div
                key={index}
                className="relative aspect-square"
                onClick={() => setSelectedImage(url)}
              >
                <img
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                />
                {/* Overlay for the 4th image when more than 4 images */}
                {index === 3 && media.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                    <span className="text-white text-lg font-bold">
                      +{media.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <ImageViewer
          src={selectedImage}
          alt="Post media"
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}
