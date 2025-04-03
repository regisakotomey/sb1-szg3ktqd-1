'use client';

import { useState } from 'react';
import { useProductForm } from '@/hooks/useProductForm';
import MobileFormLayout from './common/MobileFormLayout';
import MobileFormHeader from './common/MobileFormHeader';
import MobileFormError from './common/MobileFormError';
import MobileMultipleImageUpload from './common/MobileMultipleImageUpload';
import MobileFormActions from './common/MobileFormActions';

interface ProductFormProps {
  onClose: () => void;
  shopId: string;
}

interface MediaFile {
  file: File;
  caption: string;
}

export default function MobileProductForm({ onClose, shopId }: ProductFormProps) {
  const { submitProduct, isLoading, error } = useProductForm();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [media, setMedia] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !price || !media.length) return;

    try {
      await submitProduct({
        name,
        description,
        price: parseFloat(price),
        media: media.map(file => ({ file, caption: '' })),
        shopId
      });
      onClose();
    } catch (err) {
      // Error handling is managed by the hook
    }
  };

  return (
    <MobileFormLayout>
      <MobileFormHeader 
        title="Ajouter un article"
        onClose={onClose}
      />
      <MobileFormError error={error} />

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Nom du produit */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Nom de l'article *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px] resize-none"
              required
            />
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Prix *
            </label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                className="w-full p-3 pl-12 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                €
              </span>
            </div>
          </div>

          {/* Images */}
          <MobileMultipleImageUpload
            label="Images du produit"
            images={media}
            onImagesSelect={(files) => setMedia(prev => [...prev, ...files])}
            onImageRemove={(index) => setMedia(prev => prev.filter((_, i) => i !== index))}
            maxImages={10}
          />
        </div>
      </form>

      <MobileFormActions
        onCancel={onClose}
        isSubmitting={isLoading}
        submitLabel="Ajouter l'article"
        onSubmit={handleSubmit}
      />
    </MobileFormLayout>
  );
}