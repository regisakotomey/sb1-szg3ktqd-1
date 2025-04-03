'use client';

import { ImagePlus, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import AdSpotForm from '@/components/forms/AdSpotForm';
import ProductForm from '@/components/forms/ProductForm';

interface ShopCreationButtonsProps {
  shopId: string;
}

export default function ShopCreationButtons({
  shopId
}: ShopCreationButtonsProps) {
  const [showAdSpotForm, setShowAdSpotForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setShowAdSpotForm(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <ImagePlus size={18} />
            <span>Créer un spot publicitaire</span>
          </button>
          <button
            onClick={() => setShowProductForm(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <ShoppingBag size={18} />
            <span>Ajouter un article</span>
          </button>
        </div>
      </div>

      {showAdSpotForm && (
        <AdSpotForm
          onClose={() => setShowAdSpotForm(false)}
          shopId={shopId}
        />
      )}

      {showProductForm && (
        <ProductForm
          onClose={() => setShowProductForm(false)}
          shopId={shopId}
        />
      )}
    </>
  );
}