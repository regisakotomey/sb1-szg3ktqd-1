'use client';

import { ImageIcon, X } from 'lucide-react';
import { useRef } from 'react';

interface MobileMultipleImageUploadProps {
  label: string;
  images: File[];
  onImagesSelect: (files: File[]) => void;
  onImageRemove: (index: number, isExisting?: boolean) => void;
  maxImages?: number;
  className?: string;
  currentImages?: string[];
}

export default function MobileMultipleImageUpload({
  label,
  images,
  onImagesSelect,
  onImageRemove,
  maxImages = 5,
  className = '',
  currentImages = []
}: MobileMultipleImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length + currentImages.length <= maxImages) {
      onImagesSelect(files);
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm text-gray-700 mb-1">
        {label} ({images.length + currentImages.length}/{maxImages})
      </label>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        className="hidden"
      />
      {(images.length + currentImages.length) < maxImages && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full p-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <ImageIcon size={16} />
          <span>Ajouter des images</span>
        </button>
      )}

      {(currentImages.length > 0 || images.length > 0) && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {currentImages.map((imageUrl, index) => (
            <div key={`current-${index}`} className="relative">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => onImageRemove(index, true)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {images.map((image, index) => (
            <div key={`new-${index}`} className="relative">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => onImageRemove(index)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}