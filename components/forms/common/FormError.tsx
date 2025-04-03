'use client';

interface FormErrorProps {
  error: string | null;
}

export default function FormError({ error }: FormErrorProps) {
  if (!error) return null;
  
  return (
    <div className="p-4 bg-red-50 text-red-600 border-b border-red-100 text-xs sm:text-sm">
      {error}
    </div>
  );
}