'use client';

import { ImageIcon, X } from 'lucide-react';
import { useRef } from 'react';

interface ImageUploadProps {
  label: string;
  required?: boolean;
  image: File | null;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  className?: string;
  currentImageUrl?: string;
}

export default function ImageUpload({
  label,
  required,
  image,
  onImageSelect,
  onImageRemove,
  className = '',
  currentImageUrl
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className={className}>
      <label className="block text-xs sm:text-sm text-gray-700 mb-2">
        {label} {required && '*'}
      </label>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      {(!image && !currentImageUrl) && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
        >
          <ImageIcon size={16} />
          <span>Ajouter une image</span>
        </button>
      )}

      {(image || currentImageUrl) && (
        <div className="mt-4 relative">
          <div className="w-full h-[200px] rounded-lg overflow-hidden">
            <img
              src={image ? URL.createObjectURL(image) : currentImageUrl}
              alt="Image"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={onImageRemove}
            className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors"
          >
            <X size={14} />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <ImageIcon size={16} />
            <span>Changer l'image</span>
          </button>
        </div>
      )}
    </div>
  );
}