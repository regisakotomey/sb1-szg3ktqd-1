// Types
export interface EventType {
  value: string;
  label: string;
  category: string;
}

// Utility functions
export function getEventTypeLabel(value: string): string {
  const eventType = EVENT_TYPES.find(type => type.value === value);
  return eventType?.label || value;
}

export function getEventTypesByCategory(): Record<string, EventType[]> {
  return EVENT_TYPES.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, EventType[]>);
}

// Event type definitions by category
export const EVENT_TYPES: EventType[] = [
  // Arts & Culture
  { value: 'art_exhibition', label: 'Exposition d\'art', category: 'Arts & Culture' },
  { value: 'museum_event', label: 'Événement muséal', category: 'Arts & Culture' },
  { value: 'theater_play', label: 'Pièce de théâtre', category: 'Arts & Culture' },
  { value: 'dance_performance', label: 'Spectacle de danse', category: 'Arts & Culture' },
  { value: 'cultural_festival', label: 'Festival culturel', category: 'Arts & Culture' },
  { value: 'art_workshop', label: 'Atelier d\'art', category: 'Arts & Culture' },
  { value: 'literary_event', label: 'Événement littéraire', category: 'Arts & Culture' },
  { value: 'film_screening', label: 'Projection de film', category: 'Arts & Culture' },

  // Musique
  { value: 'concert', label: 'Concert', category: 'Musique' },
  { value: 'music_festival', label: 'Festival de musique', category: 'Musique' },
  { value: 'live_performance', label: 'Performance live', category: 'Musique' },
  { value: 'dj_set', label: 'DJ Set', category: 'Musique' },
  { value: 'opera', label: 'Opéra', category: 'Musique' },
  { value: 'classical_concert', label: 'Concert classique', category: 'Musique' },
  { value: 'jazz_night', label: 'Soirée jazz', category: 'Musique' },

  // Business & Professionnel
  { value: 'conference', label: 'Conférence', category: 'Business & Professionnel' },
  { value: 'seminar', label: 'Séminaire', category: 'Business & Professionnel' },
  { value: 'networking', label: 'Networking', category: 'Business & Professionnel' },
  { value: 'workshop', label: 'Workshop', category: 'Business & Professionnel' },
  { value: 'trade_show', label: 'Salon professionnel', category: 'Business & Professionnel' },
  { value: 'job_fair', label: 'Salon de l\'emploi', category: 'Business & Professionnel' },
  { value: 'business_meetup', label: 'Meetup professionnel', category: 'Business & Professionnel' },
  { value: 'product_launch', label: 'Lancement de produit', category: 'Business & Professionnel' },

  // Sport & Bien-être
  { value: 'sports_event', label: 'Événement sportif', category: 'Sport & Bien-être' },
  { value: 'tournament', label: 'Tournoi', category: 'Sport & Bien-être' },
  { value: 'fitness_class', label: 'Cours de fitness', category: 'Sport & Bien-être' },
  { value: 'yoga_session', label: 'Session de yoga', category: 'Sport & Bien-être' },
  { value: 'marathon', label: 'Marathon', category: 'Sport & Bien-être' },
  { value: 'wellness_workshop', label: 'Atelier bien-être', category: 'Sport & Bien-être' },
  { value: 'sports_competition', label: 'Compétition sportive', category: 'Sport & Bien-être' },

  // Gastronomie
  { value: 'food_festival', label: 'Festival gastronomique', category: 'Gastronomie' },
  { value: 'wine_tasting', label: 'Dégustation de vin', category: 'Gastronomie' },
  { value: 'cooking_class', label: 'Cours de cuisine', category: 'Gastronomie' },
  { value: 'food_market', label: 'Marché gourmand', category: 'Gastronomie' },
  { value: 'beer_festival', label: 'Festival de la bière', category: 'Gastronomie' },
  { value: 'gourmet_dinner', label: 'Dîner gastronomique', category: 'Gastronomie' },

  // Mode & Shopping
  { value: 'fashion_show', label: 'Défilé de mode', category: 'Mode & Shopping' },
  { value: 'shopping_event', label: 'Événement shopping', category: 'Mode & Shopping' },
  { value: 'trunk_show', label: 'Vente privée', category: 'Mode & Shopping' },
  { value: 'pop_up_store', label: 'Pop-up store', category: 'Mode & Shopping' },
  { value: 'sample_sale', label: 'Vente d\'échantillons', category: 'Mode & Shopping' },

  // Éducation
  { value: 'lecture', label: 'Conférence académique', category: 'Éducation' },
  { value: 'training', label: 'Formation', category: 'Éducation' },
  { value: 'workshop_edu', label: 'Atelier éducatif', category: 'Éducation' },
  { value: 'science_event', label: 'Événement scientifique', category: 'Éducation' },
  { value: 'language_exchange', label: 'Échange linguistique', category: 'Éducation' },
  { value: 'book_signing', label: 'Séance de dédicace', category: 'Éducation' },

  // Communauté & Social
  { value: 'charity_event', label: 'Événement caritatif', category: 'Communauté & Social' },
  { value: 'fundraiser', label: 'Levée de fonds', category: 'Communauté & Social' },
  { value: 'volunteer', label: 'Action bénévole', category: 'Communauté & Social' },
  { value: 'social_meetup', label: 'Rencontre sociale', category: 'Communauté & Social' },
  { value: 'community_event', label: 'Événement communautaire', category: 'Communauté & Social' },

  // Fêtes & Célébrations
  { value: 'party', label: 'Soirée', category: 'Fêtes & Célébrations' },
  { value: 'wedding', label: 'Mariage', category: 'Fêtes & Célébrations' },
  { value: 'ceremony', label: 'Cérémonie', category: 'Fêtes & Célébrations' },
  { value: 'gala', label: 'Gala', category: 'Fêtes & Célébrations' },
  { value: 'awards', label: 'Remise de prix', category: 'Fêtes & Célébrations' },
  { value: 'anniversary', label: 'Anniversaire', category: 'Fêtes & Célébrations' },

  // Technologie & Innovation
  { value: 'tech_conference', label: 'Conférence tech', category: 'Technologie & Innovation' },
  { value: 'hackathon', label: 'Hackathon', category: 'Technologie & Innovation' },
  { value: 'startup_event', label: 'Événement startup', category: 'Technologie & Innovation' },
  { value: 'tech_meetup', label: 'Meetup tech', category: 'Technologie & Innovation' },
  { value: 'demo_day', label: 'Demo Day', category: 'Technologie & Innovation' },

  // Autres
  { value: 'other', label: 'Autre', category: 'Autres' }
];

// Constants
export const EVENT_CATEGORIES = Array.from(
  new Set(EVENT_TYPES.map(type => type.category))
);

// Validation
export function isValidEventType(value: string): boolean {
  return EVENT_TYPES.some(type => type.value === value);
}

// Search
export function searchEventTypes(query: string): EventType[] {
  const normalizedQuery = query.toLowerCase();
  return EVENT_TYPES.filter(type => 
    type.label.toLowerCase().includes(normalizedQuery) ||
    type.category.toLowerCase().includes(normalizedQuery)
  );
}