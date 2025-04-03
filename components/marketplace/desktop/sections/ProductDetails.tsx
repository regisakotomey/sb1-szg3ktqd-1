'use client';

interface ProductDetailsProps {
  description: string;
}

export default function ProductDetails({
  description
}: ProductDetailsProps) {
  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Description</h2>
      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
        {description}
      </p>
    </div>
  );
}