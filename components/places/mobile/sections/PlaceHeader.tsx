'use client';

import { Store } from 'lucide-react';
import { Place } from '@/types/place';
import { getPlaceTypeLabel } from '@/lib/place-types';
import { useState } from 'react';
import ImageViewer from '@/components/ui/ImageViewer';

interface PlaceHeaderProps {
  place: Place;
}

export default function PlaceHeader({ place }: PlaceHeaderProps) {
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  const handleImageClick = (image: string) => {
    setViewerImage(image);
    setShowImageViewer(true);
  };

  return (
    <>
      {/* Main Image Container */}
      <div className="relative">
        {/* Main Image */}
        <img
          src={place.mainImage}
          alt={place.name}
          className="w-full h-[50vh] object-cover"
          onClick={() => handleImageClick(place.mainImage)}
        />

        {/* Place Type Badge */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {getPlaceTypeLabel(place.type)}
        </div>

        {/* Logo and Name Container with Gradient */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 flex items-end gap-3">
          {/* Logo */}
          <div 
            className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 border-2 border-white"
            onClick={() => place.logo && handleImageClick(place.logo)}
          >
            {place.logo ? (
              <img
                src={place.logo}
                alt={`Logo de ${place.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Store size={24} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Name and Type */}
          <div className="flex-1 min-w-0">
            <div className="text-white/90 text-xs font-medium mb-1">
              {getPlaceTypeLabel(place.type)}
            </div>
            <h1 className="text-lg font-bold text-white truncate">
              {place.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Image Viewer */}
      {showImageViewer && viewerImage && (
        <ImageViewer
          src={viewerImage}
          alt={place.name}
          onClose={() => {
            setShowImageViewer(false);
            setViewerImage(null);
          }}
        />
      )}
    </>
  );
}