'use client';

import { ImageIcon, X } from 'lucide-react';
import { useRef } from 'react';

interface MultipleImageUploadProps {
  label: string;
  images: File[];
  onImagesSelect: (files: File[]) => void;
  onImageRemove: (index: number, isExisting?: boolean) => void;
  maxImages?: number;
  className?: string;
  currentImages?: string[];
}

export default function MultipleImageUpload({
  label,
  images,
  onImagesSelect,
  onImageRemove,
  maxImages = 5,
  className = '',
  currentImages = []
}: MultipleImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length + currentImages.length <= maxImages) {
      onImagesSelect(files);
    }
  };

  return (
    <div className={className}>
      <label className="block text-xs sm:text-sm text-gray-700 mb-2">
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
          className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
        >
          <ImageIcon size={16} />
          <span>Ajouter des images</span>
        </button>
      )}

      {(images.length > 0 || currentImages.length > 0) && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentImages.map((imageUrl, index) => (
            <div key={`current-${index}`} className="relative">
              <div className="w-full h-[120px] rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => onImageRemove(index, true)}
                className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {images.map((image, index) => (
            <div key={`new-${index}`} className="relative">
              <div className="w-full h-[120px] rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => onImageRemove(index)}
                className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors"
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