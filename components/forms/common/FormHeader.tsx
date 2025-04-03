'use client';

import { X } from 'lucide-react';

interface FormHeaderProps {
  title: string;
  onClose: () => void;
}

export default function FormHeader({ title, onClose }: FormHeaderProps) {
  return (
    <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center z-10">
      <div>
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Les champs marqués de * sont obligatoires</p>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}