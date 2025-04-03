'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import { compressImage, compressImages } from '@/lib/imageCompression';

interface OpportunityFormData {
  type: string;
  title: string;
  description: string;
  mainImage: File;
  additionalImages?: File[];
  country: string;
  coordinates?: string;
  locationDetails: string;
  phone?: string;
  email?: string;
  website?: string;
  placeId?: string;
  organizerType?: 'user' | 'place';
}

export function useOpportunityForm() {
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

  const validateForm = (data: OpportunityFormData): string | null => {
    if (!data.type) return 'Le type d\'opportunité est requis';
    if (!data.title) return 'Le titre est requis';
    if (!data.description) return 'La description est requise';
    if (!data.mainImage) return 'Une image principale est requise';
    if (!data.country) return 'Le pays est requis';
    if (!data.locationDetails) return 'L\'indication du lieu est requise';
    if (!data.phone && !data.email && !data.website) {
      return 'Au moins un moyen de contact est requis';
    }
    return null;
  };

  const submitOpportunity = async (formData: OpportunityFormData) => {
    if (!checkAuth()) {
      throw new Error('Vous devez être connecté et vérifié pour créer une opportunité');
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

      // Compress images
      const compressedMainMedia = await compressImage(formData.mainImage);
      const compressedAdditionalMedia = formData.additionalImages 
        ? await compressImages(formData.additionalImages)
        : undefined;

      // Add user ID
      form.append('userId', userData!.id);

      // Add form data
      form.append('type', formData.type);
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('mainImage', formData.mainImage);
      if (formData.additionalImages) {
        formData.additionalImages.forEach(file => {
          form.append('additionalImages', file);
        });
      }
      form.append('country', formData.country);
      if (formData.coordinates) {
        form.append('coordinates', formData.coordinates);
      }
      form.append('locationDetails', formData.locationDetails);
      if (formData.phone) form.append('phone', formData.phone);
      if (formData.email) form.append('email', formData.email);
      if (formData.website) form.append('website', formData.website);
      if (formData.placeId) form.append('placeId', formData.placeId);

      const response = await fetch('/api/opportunities/add', {
        method: 'POST',
        body: form
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      const opportunity = await response.json();
      router.push(`/content/opportunities/${opportunity._id}`);
      return opportunity;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOpportunity = async (formData: FormData) => {
    if (!checkAuth()) {
      throw new Error('Vous devez être connecté et vérifié pour modifier une opportunité');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/opportunities/edit', {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      const opportunity = await response.json();
      return opportunity;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitOpportunity,
    updateOpportunity,
    isLoading,
    error
  };
}