interface PlaceData {
  type: string;
  name: string;
  longDescription: string;
  mainImage: string;
  country: string;
  locationDetails: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export function isValidPlace(data: PlaceData): string | null {
  if (!data.type) {
    return 'Le type de lieu est requis';
  }

  if (!data.name || data.name.length < 2) {
    return 'Le nom doit contenir au moins 2 caractères';
  }

  if (!data.longDescription || data.longDescription.length < 10) {
    return 'La description doit contenir au moins 10 caractères';
  }

  if (!data.mainImage) {
    return 'Une image principale est requise';
  }

  if (!data.country) {
    return 'Le pays est requis';
  }

  if (!data.locationDetails) {
    return 'L\'indication du lieu est requise';
  }

  // Vérifier qu'au moins un moyen de contact est fourni
  if (!data.contact.phone && !data.contact.email && !data.contact.website) {
    return 'Au moins un moyen de contact (téléphone, email ou site web) est requis';
  }

  if (data.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact.email)) {
    return 'Email invalide';
  }

  if (data.contact.website && !/^https?:\/\//.test(data.contact.website)) {
    return 'URL du site web invalide';
  }

  return null;
}