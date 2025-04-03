import { isBefore, isAfter } from 'date-fns';

interface EventData {
  title: string;
  type: string;
  description: string;
  startDate: Date;
  endDate: Date;
  mainMedia: string;
  country: string;
  coordinates?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  additionalMedia?: string[];
}

export function isValidEvent(data: EventData): string | null {
  if (!data.title || data.title.length < 3) {
    return 'Le titre doit contenir au moins 3 caractères';
  }

  if (!data.type) {
    return 'Le type d\'événement est requis';
  }

  if (!data.description || data.description.length < 10) {
    return 'La description doit contenir au moins 10 caractères';
  }

  if (!data.startDate || !data.endDate) {
    return 'Les dates sont requises';
  }

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const now = new Date();

  if (isBefore(start, now)) {
    return 'La date de début doit être future';
  }

  if (isBefore(end, start)) {
    return 'La date de fin doit être après la date de début';
  }

  if (!data.mainMedia) {
    return 'Une image ou vidéo principale est requise';
  }

  if (!data.country) {
    return 'Le pays est requis';
  }

  if (!data.address) {
    return 'L\'adresse est requise';
  }

  // Vérifier qu'au moins un moyen de contact est fourni
  if (!data.phone && !data.email && !data.website) {
    return 'Au moins un moyen de contact (téléphone, email ou site web) est requis';
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return 'Email invalide';
  }

  if (data.website && !/^https?:\/\//.test(data.website)) {
    return 'URL du site web invalide';
  }

  if (data.additionalMedia && data.additionalMedia.length > 5) {
    return 'Maximum 5 médias additionnels autorisés';
  }

  return null;
}