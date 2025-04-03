'use client';

import { useState } from 'react';
import { useProductForm } from '@/hooks/useProductForm';
import FormLayout from './common/FormLayout';
import FormHeader from './common/FormHeader';
import FormError from './common/FormError';
import MultipleImageUpload from './common/MultipleImageUpload';
import FormActions from './common/FormActions';
import { Product } from '@/types/product';

interface EditProductFormProps {
  product: Product;
  onClose: () => void;
}

export default function EditProductForm({ product, onClose }: EditProductFormProps) {
  const { updateProduct, isLoading, error } = useProductForm();
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price.toString());
  const [media, setMedia] = useState<File[]>([]);
  const [currentMedia, setCurrentMedia] = useState(product.media.map(m => m.url));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !price || (!media.length && !currentMedia.length)) return;

    try {
      const formData = new FormData();
      formData.append('productId', product._id);
      formData.append('userId', product.userId);
      formData.append('shopId', product.shopId);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);

      // Add new media files
      media.forEach(file => {
        formData.append('media', file);
      });

      // Add current media URLs
      formData.append('currentMedia', JSON.stringify(currentMedia));

      await updateProduct(formData);
      onClose();
    } catch (err) {
      // Error handling is managed by the hook
    }
  };

  const handleMediaRemove = (index: number, isExisting?: boolean) => {
    if (isExisting) {
      setCurrentMedia(prev => prev.filter((_, i) => i !== index));
    } else {
      setMedia(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <FormLayout>
      <FormHeader 
        title="Modifier l'article"
        onClose={onClose}
      />
      <FormError error={error} />

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
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
            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[150px] resize-y"
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
        <MultipleImageUpload
          label="Images du produit"
          images={media}
          onImagesSelect={(files) => setMedia(prev => [...prev, ...files])}
          onImageRemove={handleMediaRemove}
          maxImages={10}
          className="mb-6"
          currentImages={currentMedia}
        />

        {/* Actions */}
        <FormActions
          onCancel={onClose}
          isSubmitting={isLoading}
          submitLabel="Modifier l'article"
        />
      </form>
    </FormLayout>
  );
}