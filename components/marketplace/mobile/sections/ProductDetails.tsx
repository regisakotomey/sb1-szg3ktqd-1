'use client';

interface Product {
  name: string;
  description: string;
  price: number;
}

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-3">Description</h3>
      <p className="text-sm text-gray-600 whitespace-pre-wrap">
        {product.description}
      </p>
    </div>
  );
}