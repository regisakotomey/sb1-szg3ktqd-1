'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';

interface ShopFormData {
  type: string;
  name: string;
  description: string;
  logo?: File;
  countries: string[];
  phone?: string;
  email?: string;
  website?: string;
  placeId?: string;
}

export function useShopForm() {
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

  const validateForm = (data: ShopFormData): string | null => {
    if (!data.type) return 'Le type de boutique est requis';
    if (!data.name) return 'Le nom de la boutique est requis';
    if (!data.description) return 'La description est requise';
    if (!data.countries.length) return 'Au moins un pays est requis';
    if (!data.phone && !data.email && !data.website) {
      return 'Au moins un moyen de contact est requis';
    }
    return null;
  };

  const submitShop = async (formData: ShopFormData) => {
    if (!checkAuth()) {
      throw new Error('Vous devez être connecté et vérifié pour créer une boutique');
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

      // Ajouter l'ID de l'utilisateur
      form.append('userId', userData!.id);

      // Ajouter les données du formulaire
      form.append('type', formData.type);
      form.append('name', formData.name);
      form.append('description', formData.description);
      if (formData.logo) {
        form.append('logo', formData.logo);
      }
      formData.countries.forEach(country => {
        form.append('countries[]', country);
      });
      if (formData.phone) form.append('phone', formData.phone);
      if (formData.email) form.append('email', formData.email);
      if (formData.website) form.append('website', formData.website);
      if (formData.placeId) form.append('placeId', formData.placeId);

      const response = await fetch('/api/shops/add', {
        method: 'POST',
        body: form
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      const shop = await response.json();
      router.push(`/content/shops/${shop._id}`);
      return shop;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateShop = async (formData: FormData) => {
    if (!checkAuth()) {
      throw new Error('Vous devez être connecté et vérifié pour modifier une boutique');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/shops/edit', {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      const shop = await response.json();
      return shop;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitShop,
    updateShop,
    isLoading,
    error
  };
}