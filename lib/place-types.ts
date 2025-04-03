export interface PlaceType {
  value: string;
  label: string;
  category: string;
}

// Utility functions
export function getPlaceTypeLabel(value: string): string {
  const placeType = PLACE_TYPES.find(type => type.value === value);
  return placeType?.label || value;
}

export function getPlaceTypesByCategory(): Record<string, PlaceType[]> {
  return PLACE_TYPES.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, PlaceType[]>);
}

export const PLACE_TYPES: PlaceType[] = [
  // Restauration
  { value: 'restaurant', label: 'Restaurant', category: 'Restauration' },
  { value: 'cafe', label: 'Café', category: 'Restauration' },
  { value: 'bistrot', label: 'Bistrot', category: 'Restauration' },
  { value: 'brasserie', label: 'Brasserie', category: 'Restauration' },
  { value: 'fast_food', label: 'Fast-food', category: 'Restauration' },
  { value: 'food_truck', label: 'Food truck', category: 'Restauration' },
  { value: 'pizzeria', label: 'Pizzeria', category: 'Restauration' },
  { value: 'sushi_bar', label: 'Bar à sushi', category: 'Restauration' },
  { value: 'patisserie', label: 'Pâtisserie', category: 'Restauration' },
  { value: 'glacier', label: 'Glacier', category: 'Restauration' },

  // Bars & Vie nocturne
  { value: 'bar', label: 'Bar', category: 'Bars & Vie nocturne' },
  { value: 'pub', label: 'Pub', category: 'Bars & Vie nocturne' },
  { value: 'wine_bar', label: 'Bar à vin', category: 'Bars & Vie nocturne' },
  { value: 'cocktail_bar', label: 'Bar à cocktails', category: 'Bars & Vie nocturne' },
  { value: 'nightclub', label: 'Boîte de nuit', category: 'Bars & Vie nocturne' },
  { value: 'karaoke', label: 'Karaoké', category: 'Bars & Vie nocturne' },
  { value: 'lounge', label: 'Lounge', category: 'Bars & Vie nocturne' },

  // Shopping
  { value: 'boutique', label: 'Boutique', category: 'Shopping' },
  { value: 'mall', label: 'Centre commercial', category: 'Shopping' },
  { value: 'supermarket', label: 'Supermarché', category: 'Shopping' },
  { value: 'market', label: 'Marché', category: 'Shopping' },
  { value: 'fashion_store', label: 'Magasin de mode', category: 'Shopping' },
  { value: 'jewelry', label: 'Bijouterie', category: 'Shopping' },
  { value: 'bookstore', label: 'Librairie', category: 'Shopping' },
  { value: 'electronics', label: 'Magasin d\'électronique', category: 'Shopping' },

  // Culture & Divertissement
  { value: 'museum', label: 'Musée', category: 'Culture & Divertissement' },
  { value: 'gallery', label: 'Galerie d\'art', category: 'Culture & Divertissement' },
  { value: 'theater', label: 'Théâtre', category: 'Culture & Divertissement' },
  { value: 'cinema', label: 'Cinéma', category: 'Culture & Divertissement' },
  { value: 'concert_hall', label: 'Salle de concert', category: 'Culture & Divertissement' },
  { value: 'library', label: 'Bibliothèque', category: 'Culture & Divertissement' },
  { value: 'cultural_center', label: 'Centre culturel', category: 'Culture & Divertissement' },

  // Sport & Bien-être
  { value: 'gym', label: 'Salle de sport', category: 'Sport & Bien-être' },
  { value: 'yoga_studio', label: 'Studio de yoga', category: 'Sport & Bien-être' },
  { value: 'spa', label: 'Spa', category: 'Sport & Bien-être' },
  { value: 'swimming_pool', label: 'Piscine', category: 'Sport & Bien-être' },
  { value: 'sports_center', label: 'Centre sportif', category: 'Sport & Bien-être' },
  { value: 'dance_studio', label: 'Studio de danse', category: 'Sport & Bien-être' },
  { value: 'martial_arts', label: 'Arts martiaux', category: 'Sport & Bien-être' },

  // Hébergement
  { value: 'hotel', label: 'Hôtel', category: 'Hébergement' },
  { value: 'hostel', label: 'Auberge', category: 'Hébergement' },
  { value: 'guest_house', label: 'Maison d\'hôtes', category: 'Hébergement' },
  { value: 'bed_breakfast', label: 'Chambre d\'hôtes', category: 'Hébergement' },
  { value: 'resort', label: 'Resort', category: 'Hébergement' },

  // Services
  { value: 'bank', label: 'Banque', category: 'Services' },
  { value: 'post_office', label: 'Bureau de poste', category: 'Services' },
  { value: 'pharmacy', label: 'Pharmacie', category: 'Services' },
  { value: 'hospital', label: 'Hôpital', category: 'Services' },
  { value: 'clinic', label: 'Clinique', category: 'Services' },
  { value: 'dentist', label: 'Cabinet dentaire', category: 'Services' },
  { value: 'hair_salon', label: 'Salon de coiffure', category: 'Services' },
  { value: 'beauty_salon', label: 'Institut de beauté', category: 'Services' },

  // Éducation
  { value: 'school', label: 'École', category: 'Éducation' },
  { value: 'university', label: 'Université', category: 'Éducation' },
  { value: 'language_school', label: 'École de langues', category: 'Éducation' },
  { value: 'art_school', label: 'École d\'art', category: 'Éducation' },
  { value: 'music_school', label: 'École de musique', category: 'Éducation' },
  { value: 'cooking_school', label: 'École de cuisine', category: 'Éducation' },

  // Lieux de culte
  { value: 'church', label: 'Église', category: 'Lieux de culte' },
  { value: 'mosque', label: 'Mosquée', category: 'Lieux de culte' },
  { value: 'synagogue', label: 'Synagogue', category: 'Lieux de culte' },
  { value: 'temple', label: 'Temple', category: 'Lieux de culte' },

  // Autres
  { value: 'other', label: 'Autre', category: 'Autres' }
];
