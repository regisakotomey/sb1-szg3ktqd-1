'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';

interface PlaceFormData {
  type: string;
  name: string;
  shortDescription: string;
  longDescription?: string;
  services?: string;
  logo?: File;
  mainImage: File;
  additionalImages?: File[];
  country: string;
  coordinates?: string;
  locationDetails: string;
  openingHours: Array<{
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }>;
  phone?: string;
  email?: string;
  website?: string;
}

export function usePlaceForm() {
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

  const validateForm = (data: PlaceFormData): string | null => {
    if (!data.type) return 'Le type de lieu est requis';
    if (!data.name) return 'Le nom du lieu est requis';
    if (!data.shortDescription) return 'La courte description est requise';
    if (!data.mainImage) return 'Une image principale est requise';
    if (!data.country) return 'Le pays est requis';
    if (!data.locationDetails) return 'L\'indication du lieu est requise';
    if (!data.phone && !data.email && !data.website) {
      return 'Au moins un moyen de contact est requis';
    }

    const hasValidOpeningHours = data.openingHours.some(day => day.isOpen);
    if (!hasValidOpeningHours) {
      return 'Au moins un jour d\'ouverture doit être défini';
    }

    return null;
  };

  const submitPlace = async (formData: PlaceFormData) => {
    if (!checkAuth()) {
      throw new Error('Vous devez être connecté et vérifié pour créer un lieu');
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

      // Add form data
      form.append('type', formData.type);
      form.append('name', formData.name);
      form.append('shortDescription', formData.shortDescription);
      if (formData.longDescription) {
        form.append('longDescription', formData.longDescription);
      }
      if (formData.services) {
        form.append('services', formData.services);
      }
      if (formData.logo) {
        form.append('logo', formData.logo);
      }
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
      form.append('openingHours', JSON.stringify(formData.openingHours));
      if (formData.phone) form.append('phone', formData.phone);
      if (formData.email) form.append('email', formData.email);
      if (formData.website) form.append('website', formData.website);

      const response = await fetch('/api/places/add', {
        method: 'POST',
        body: form
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      const place = await response.json();
      router.push(`/content/places/${place._id}`);
      return place;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlace = async (formData: FormData) => {
    if (!checkAuth()) {
      throw new Error('Vous devez être connecté et vérifié pour modifier un lieu');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/places/edit', {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      const place = await response.json();
      return place;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitPlace,
    updatePlace,
    isLoading,
    error
  };
}