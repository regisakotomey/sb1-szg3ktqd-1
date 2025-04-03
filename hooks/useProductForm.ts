'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import { compressImage, compressImages } from '@/lib/imageCompression';

interface MediaFile {
  file: File;
  caption: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  media: MediaFile[];
  shopId: string;
}

export function useProductForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = () => {
    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/login');
      return false;
    }
    return userData.isVerified;
  };

  const validateForm = (data: ProductFormData): string | null => {
    if (!data.name.trim()) {
      return 'Le nom du produit est requis';
    }
    if (!data.description.trim()) {
      return 'La description est requise';
    }
    if (!data.price || data.price <= 0) {
      return 'Le prix doit être supérieur à 0';
    }
    if (!data.media.length) {
      return 'Au moins une image est requise';
    }
    if (data.media.length > 10) {
      return 'Maximum 10 images autorisées';
    }
    return null;
  };

  const submitProduct = async (formData: ProductFormData) => {
    if (!checkAuth()) {
      throw new Error('Vous devez être connecté et vérifié pour ajouter un produit');
    }

    setIsLoading(true);
    setError(null);

    try {
      const validationError = validateForm(formData);
      if (validationError) {
        throw new Error(validationError);
      }

      const form = new FormData();
      const userData = getUserData();

      // Add user ID and shop ID
      form.append('userId', userData!.id);
      form.append('shopId', formData.shopId);
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('price', formData.price.toString());

      // Compress and add media files
      const compressedMediaPromises = formData.media.map(async (mediaItem) => {
        const compressedFile = await compressImage(mediaItem.file);
        return {
          file: compressedFile,
          caption: mediaItem.caption
        };
      });

      const compressedMedia = await Promise.all(compressedMediaPromises);

      // Add compressed media files and captions
      compressedMedia.forEach((mediaItem, index) => {
        form.append(`media`, mediaItem.file);
        form.append(`captions[${index}]`, mediaItem.caption);
      });

      const response = await fetch('/api/products/add', {
        method: 'POST',
        body: form
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      const product = await response.json();
      router.push(`/content/marketplace/${product._id}`);
      return product;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (formData: FormData) => {
    if (!checkAuth()) {
      throw new Error('Vous devez être connecté et vérifié pour modifier un produit');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/products/edit', {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      const product = await response.json();
      return product;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitProduct,
    updateProduct,
    isLoading,
    error
  };
}