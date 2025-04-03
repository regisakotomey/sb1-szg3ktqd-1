'use client';

import { Store } from 'lucide-react';
import { getPlaceTypeLabel } from '@/lib/place-types';
import { useState } from 'react';
import ImageViewer from '@/components/ui/ImageViewer';

interface PlaceHeaderProps {
  name: string;
  mainImage: string;
  logo?: string;
  type: string;
}

export default function PlaceHeader({ 
  name,
  mainImage,
  logo,
  type
}: PlaceHeaderProps) {
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  const handleImageClick = (image: string) => {
    setViewerImage(image);
    setShowImageViewer(true);
  };

  return (
    <>
      <div className="w-full h-[400px] rounded-xl overflow-hidden mb-6 relative">
        {/* Main Image */}
        <img
          src={mainImage}
          alt={name}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => handleImageClick(mainImage)}
        />

        {/* Place Type Badge */}
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
          {getPlaceTypeLabel(type)}
        </div>

        {/* Logo and Name Container */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 flex items-end gap-4">
          {/* Logo */}
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-white flex-shrink-0 border-4 border-white cursor-pointer"
               onClick={() => logo && handleImageClick(logo)}>
            {logo ? (
              <img
                src={logo}
                alt={`Logo de ${name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Store size={32} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Name and Type */}
          <div>
            <div className="text-white/90 text-sm font-medium mb-1">
              {getPlaceTypeLabel(type)}
            </div>
            <h1 className="text-3xl font-bold text-white">{name}</h1>
          </div>
        </div>
      </div>

      {/* Image Viewer */}
      {showImageViewer && viewerImage && (
        <ImageViewer
          src={viewerImage}
          alt={name}
          onClose={() => {
            setShowImageViewer(false);
            setViewerImage(null);
          }}
        />
      )}
    </>
  );
}