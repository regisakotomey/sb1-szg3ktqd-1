'use client';

import { X } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageViewer({ src, alt, onClose }: ImageViewerProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 mt-14"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <X size={24} />
      </button>

      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}