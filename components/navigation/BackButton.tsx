'use client';

import { ChevronLeft } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';

interface BackButtonProps {
  className?: string;
}

export default function BackButton({ className = '' }: BackButtonProps) {
  const { goBack } = useNavigation();

  return (
    <button
      onClick={goBack}
      className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${className}`}
    >
      <ChevronLeft size={20} />
    </button>
  );
}