'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import { compressImage, compressImages } from '@/lib/imageCompression';

interface EventFormData {
  title: string;
  type: string;
  description: string;
  startDate: string;
  endDate: string;
  mainMedia: File;
  additionalMedia?: File[];
  country: string;
  coordinates: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  placeId?: string;
}

export function useEventForm() {
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

  const submitEvent = async (formData: EventFormData) => {
    if (!checkAuth()) {
      throw new Error('Vous devez être connecté et vérifié pour créer un événement');
    }

    setIsLoading(true);
    setError(null);

    try {
      const userData = getUserData();
      const form = new FormData();

      // Compress images
      const compressedMainMedia = await compressImage(formData.mainMedia);
      const compressedAdditionalMedia = formData.additionalMedia 
        ? await compressImages(formData.additionalMedia)
        : undefined;

      // Add user ID
      form.append('userId', userData!.id);

      // Add form data
      form.append('title', formData.title);
      form.append('type', formData.type);
      form.append('description', formData.description);
      form.append('startDate', formData.startDate);
      form.append('endDate', formData.endDate);
      form.append('country', formData.country);
      form.append('coordinates', formData.coordinates);
      form.append('address', formData.address);
      if (formData.phone) form.append('phone', formData.phone);
      if (formData.email) form.append('email', formData.email);
      if (formData.website) form.append('website', formData.website);
      if (formData.placeId) form.append('placeId', formData.placeId);

      // Add compressed media
      form.append('mainMedia', compressedMainMedia);
      if (compressedAdditionalMedia) {
        compressedAdditionalMedia.forEach(file => {
          form.append('additionalMedia', file);
        });
      }

      const response = await fetch('/api/events/add', {
        method: 'POST',
        body: form
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      const event = await response.json();
      router.push(`/content/events/${event._id}`);
      return event;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEvent = async (formData: FormData) => {
    if (!checkAuth()) {
      throw new Error('Vous devez être connecté et vérifié pour modifier un événement');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/events/edit', {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      const event = await response.json();
      router.refresh(); // Refresh the current page to show updated data
      return event;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitEvent,
    updateEvent,
    isLoading,
    error
  };
}