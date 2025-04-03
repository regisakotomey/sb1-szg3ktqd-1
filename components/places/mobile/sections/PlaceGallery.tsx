'use client';

import { useState } from 'react';
import ImageViewer from '@/components/ui/ImageViewer';

interface PlaceGalleryProps {
  images: string[];
}

export default function PlaceGallery({ images }: PlaceGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Photos</h3>
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(image)}
              className="aspect-square rounded-lg overflow-hidden"
            >
              <img
                src={image}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <ImageViewer
          src={selectedImage}
          alt="Photo du lieu"
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}