'use client';

import { useState } from 'react';
import { getUserData } from '@/lib/storage';
import { compressImage, compressImages } from '@/lib/imageCompression';

interface PostFormData {
  content: string;
  media: File[];
}

export function usePostForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = () => {
    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      throw new Error('Vous devez être connecté et vérifié pour publier');
    }
    return userData;
  };

  const submitPost = async (formData: PostFormData) => {
    const userData = checkAuth();

    setIsLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append('userId', userData.id);
      form.append('content', formData.content);
      
      // Compress media files before upload
      if (formData.media.length > 0) {
        const compressedFiles = await compressImages(formData.media);
        compressedFiles.forEach(file => {
          form.append('media', file);
        });
      }

      const response = await fetch('/api/posts/add', {
        method: 'POST',
        body: form
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePost = async (formData: FormData) => {
    checkAuth();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/posts/edit', {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      const post = await response.json();
      return post;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitPost,
    updatePost,
    isLoading,
    error
  };
}