'use client';

interface MobileFormErrorProps {
  error: string | null;
}

export default function MobileFormError({ error }: MobileFormErrorProps) {
  if (!error) return null;
  
  return (
    <div className="px-4 py-3 bg-red-50 border-b border-red-100">
      <p className="text-sm text-red-600">{error}</p>
    </div>
  );
}