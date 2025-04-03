export interface ShopType {
  value: string;
  label: string;
  category: string;
}

// Utility functions
export function getShopTypeLabel(value: string): string {
  const shopType = SHOP_TYPES.find(type => type.value === value);
  return shopType?.label || value;
}

export const SHOP_TYPES: ShopType[] = [
  // Mode & Accessoires
  { value: 'fashion_clothing', label: 'Vêtements', category: 'Mode & Accessoires' },
  { value: 'fashion_shoes', label: 'Chaussures', category: 'Mode & Accessoires' },
  { value: 'fashion_accessories', label: 'Accessoires de mode', category: 'Mode & Accessoires' },
  { value: 'fashion_jewelry', label: 'Bijouterie', category: 'Mode & Accessoires' },
  { value: 'fashion_luxury', label: 'Articles de luxe', category: 'Mode & Accessoires' },
  { value: 'fashion_sportswear', label: 'Vêtements de sport', category: 'Mode & Accessoires' },
  { value: 'fashion_children', label: 'Mode enfant', category: 'Mode & Accessoires' },

  // Électronique & High-Tech
  { value: 'tech_phones', label: 'Téléphonie', category: 'Électronique & High-Tech' },
  { value: 'tech_computers', label: 'Informatique', category: 'Électronique & High-Tech' },
  { value: 'tech_gaming', label: 'Gaming', category: 'Électronique & High-Tech' },
  { value: 'tech_audio', label: 'Audio & Hi-Fi', category: 'Électronique & High-Tech' },
  { value: 'tech_photo', label: 'Photo & Vidéo', category: 'Électronique & High-Tech' },
  { value: 'tech_accessories', label: 'Accessoires tech', category: 'Électronique & High-Tech' },

  // Maison & Décoration
  { value: 'home_furniture', label: 'Mobilier', category: 'Maison & Décoration' },
  { value: 'home_decor', label: 'Décoration', category: 'Maison & Décoration' },
  { value: 'home_lighting', label: 'Luminaires', category: 'Maison & Décoration' },
  { value: 'home_textiles', label: 'Textiles', category: 'Maison & Décoration' },
  { value: 'home_kitchen', label: 'Articles de cuisine', category: 'Maison & Décoration' },
  { value: 'home_garden', label: 'Jardin & Extérieur', category: 'Maison & Décoration' },

  // Beauté & Bien-être
  { value: 'beauty_cosmetics', label: 'Cosmétiques', category: 'Beauté & Bien-être' },
  { value: 'beauty_perfume', label: 'Parfumerie', category: 'Beauté & Bien-être' },
  { value: 'beauty_skincare', label: 'Soins de la peau', category: 'Beauté & Bien-être' },
  { value: 'beauty_haircare', label: 'Soins capillaires', category: 'Beauté & Bien-être' },
  { value: 'beauty_wellness', label: 'Bien-être', category: 'Beauté & Bien-être' },

  // Sports & Loisirs
  { value: 'sports_equipment', label: 'Équipement sportif', category: 'Sports & Loisirs' },
  { value: 'sports_outdoor', label: 'Sports outdoor', category: 'Sports & Loisirs' },
  { value: 'sports_fitness', label: 'Fitness', category: 'Sports & Loisirs' },
  { value: 'sports_cycling', label: 'Cyclisme', category: 'Sports & Loisirs' },
  { value: 'sports_water', label: 'Sports nautiques', category: 'Sports & Loisirs' },

  // Culture & Divertissement
  { value: 'culture_books', label: 'Librairie', category: 'Culture & Divertissement' },
  { value: 'culture_music', label: 'Musique', category: 'Culture & Divertissement' },
  { value: 'culture_movies', label: 'Films & Séries', category: 'Culture & Divertissement' },
  { value: 'culture_games', label: 'Jeux & Jouets', category: 'Culture & Divertissement' },
  { value: 'culture_art', label: 'Art & Collection', category: 'Culture & Divertissement' },

  // Alimentation & Boissons
  { value: 'food_grocery', label: 'Épicerie', category: 'Alimentation & Boissons' },
  { value: 'food_organic', label: 'Bio & Naturel', category: 'Alimentation & Boissons' },
  { value: 'food_wine', label: 'Vins & Spiritueux', category: 'Alimentation & Boissons' },
  { value: 'food_gourmet', label: 'Épicerie fine', category: 'Alimentation & Boissons' },
  { value: 'food_health', label: 'Alimentation santé', category: 'Alimentation & Boissons' },

  // Santé & Parapharmacie
  { value: 'health_pharmacy', label: 'Parapharmacie', category: 'Santé & Parapharmacie' },
  { value: 'health_natural', label: 'Produits naturels', category: 'Santé & Parapharmacie' },
  { value: 'health_medical', label: 'Matériel médical', category: 'Santé & Parapharmacie' },
  { value: 'health_optical', label: 'Optique', category: 'Santé & Parapharmacie' },

  // Auto & Moto
  { value: 'auto_parts', label: 'Pièces auto', category: 'Auto & Moto' },
  { value: 'auto_accessories', label: 'Accessoires auto', category: 'Auto & Moto' },
  { value: 'auto_moto', label: 'Moto & Scooter', category: 'Auto & Moto' },
  { value: 'auto_tools', label: 'Outillage', category: 'Auto & Moto' },

  // Autres
  { value: 'other', label: 'Autre', category: 'Autres' }
];

// Fonction utilitaire pour grouper les types par catégorie
export function getShopTypesByCategory() {
  return SHOP_TYPES.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, ShopType[]>);
}