'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import { compressImage, compressImages } from '@/lib/imageCompression';

interface MediaFile {
  file: File;
  caption: string;
}

interface AdSpotFormData {
  media: MediaFile[];
  placeId?: string;
  shopId?: string;
}

export function useAdSpotForm() {
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

  const validateForm = (data: AdSpotFormData): string | null => {
    if (!data.media.length) {
      return 'Au moins un média est requis';
    }
    if (data.media.length > 10) {
      return 'Maximum 10 médias autorisés';
    }
    if (!data.placeId && !data.shopId) {
      return 'Un spot publicitaire doit être associé à un lieu ou une boutique';
    }
    if (data.placeId && data.shopId) {
      return 'Un spot publicitaire ne peut pas être associé à la fois à un lieu et une boutique';
    }
    return null;
  };

  const submitAdSpot = async (formData: AdSpotFormData) => {
    if (!checkAuth()) {
      throw new Error('Vous devez être connecté et vérifié pour créer un spot publicitaire');
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

      // Add user ID
      form.append('userId', userData!.id);

      // Add place or shop ID
      if (formData.placeId) {
        form.append('placeId', formData.placeId);
      }
      if (formData.shopId) {
        form.append('shopId', formData.shopId);
      }

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

      const response = await fetch('/api/ads/add', {
        method: 'POST',
        body: form
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      const adSpot = await response.json();
      router.push(`/content/ads/${adSpot._id}`);
      return adSpot;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitAdSpot,
    isLoading,
    error
  };
}