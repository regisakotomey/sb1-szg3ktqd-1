export interface BusinessSector {
  value: string;
  label: string;
  category: string;
}

export const BUSINESS_SECTORS: BusinessSector[] = [
  // Agriculture & Agroalimentaire
  { value: 'agriculture', label: 'Agriculture', category: 'Agriculture & Agroalimentaire' },
  { value: 'livestock', label: 'Élevage', category: 'Agriculture & Agroalimentaire' },
  { value: 'food_industry', label: 'Industrie alimentaire', category: 'Agriculture & Agroalimentaire' },
  { value: 'fishing', label: 'Pêche et aquaculture', category: 'Agriculture & Agroalimentaire' },
  { value: 'viticulture', label: 'Viticulture', category: 'Agriculture & Agroalimentaire' },

  // Artisanat & Métiers d'art
  { value: 'crafts', label: 'Artisanat traditionnel', category: 'Artisanat & Métiers d\'art' },
  { value: 'woodworking', label: 'Travail du bois', category: 'Artisanat & Métiers d\'art' },
  { value: 'jewelry', label: 'Bijouterie/Joaillerie', category: 'Artisanat & Métiers d\'art' },
  { value: 'pottery', label: 'Céramique/Poterie', category: 'Artisanat & Métiers d\'art' },
  { value: 'textile_craft', label: 'Artisanat textile', category: 'Artisanat & Métiers d\'art' },

  // Commerce & Distribution
  { value: 'retail', label: 'Commerce de détail', category: 'Commerce & Distribution' },
  { value: 'wholesale', label: 'Commerce de gros', category: 'Commerce & Distribution' },
  { value: 'ecommerce', label: 'E-commerce', category: 'Commerce & Distribution' },
  { value: 'import_export', label: 'Import/Export', category: 'Commerce & Distribution' },
  { value: 'luxury_retail', label: 'Commerce de luxe', category: 'Commerce & Distribution' },

  // Construction & Immobilier
  { value: 'construction', label: 'Construction', category: 'Construction & Immobilier' },
  { value: 'real_estate', label: 'Immobilier', category: 'Construction & Immobilier' },
  { value: 'architecture', label: 'Architecture', category: 'Construction & Immobilier' },
  { value: 'interior_design', label: 'Design d\'intérieur', category: 'Construction & Immobilier' },
  { value: 'building_materials', label: 'Matériaux de construction', category: 'Construction & Immobilier' },

  // Éducation & Formation
  { value: 'education', label: 'Éducation', category: 'Éducation & Formation' },
  { value: 'training', label: 'Formation professionnelle', category: 'Éducation & Formation' },
  { value: 'e_learning', label: 'E-learning', category: 'Éducation & Formation' },
  { value: 'coaching', label: 'Coaching', category: 'Éducation & Formation' },
  { value: 'research', label: 'Recherche', category: 'Éducation & Formation' },

  // Finance & Assurance
  { value: 'banking', label: 'Banque', category: 'Finance & Assurance' },
  { value: 'insurance', label: 'Assurance', category: 'Finance & Assurance' },
  { value: 'investment', label: 'Investissement', category: 'Finance & Assurance' },
  { value: 'accounting', label: 'Comptabilité', category: 'Finance & Assurance' },
  { value: 'fintech', label: 'Fintech', category: 'Finance & Assurance' },

  // Industrie & Manufacturing
  { value: 'manufacturing', label: 'Industrie manufacturière', category: 'Industrie & Manufacturing' },
  { value: 'automotive', label: 'Automobile', category: 'Industrie & Manufacturing' },
  { value: 'aerospace', label: 'Aéronautique', category: 'Industrie & Manufacturing' },
  { value: 'electronics', label: 'Électronique', category: 'Industrie & Manufacturing' },
  { value: 'textile', label: 'Textile', category: 'Industrie & Manufacturing' },

  // Informatique & Numérique
  { value: 'software', label: 'Développement logiciel', category: 'Informatique & Numérique' },
  { value: 'it_services', label: 'Services informatiques', category: 'Informatique & Numérique' },
  { value: 'telecom', label: 'Télécommunications', category: 'Informatique & Numérique' },
  { value: 'digital_marketing', label: 'Marketing digital', category: 'Informatique & Numérique' },
  { value: 'cybersecurity', label: 'Cybersécurité', category: 'Informatique & Numérique' },

  // Restauration & Hôtellerie
  { value: 'restaurants', label: 'Restaurants', category: 'Restauration & Hôtellerie' },
  { value: 'hotels', label: 'Hôtels', category: 'Restauration & Hôtellerie' },
  { value: 'catering', label: 'Traiteur', category: 'Restauration & Hôtellerie' },
  { value: 'tourism', label: 'Tourisme', category: 'Restauration & Hôtellerie' },
  { value: 'hospitality', label: 'Hébergement', category: 'Restauration & Hôtellerie' },

  // Santé & Bien-être
  { value: 'healthcare', label: 'Santé', category: 'Santé & Bien-être' },
  { value: 'pharmacy', label: 'Pharmacie', category: 'Santé & Bien-être' },
  { value: 'medical_devices', label: 'Dispositifs médicaux', category: 'Santé & Bien-être' },
  { value: 'wellness', label: 'Bien-être', category: 'Santé & Bien-être' },
  { value: 'sports', label: 'Sport', category: 'Santé & Bien-être' },

  // Services
  { value: 'consulting', label: 'Conseil', category: 'Services' },
  { value: 'legal', label: 'Services juridiques', category: 'Services' },
  { value: 'marketing', label: 'Marketing & Communication', category: 'Services' },
  { value: 'hr', label: 'Ressources humaines', category: 'Services' },
  { value: 'cleaning', label: 'Services de nettoyage', category: 'Services' },

  // Transport & Logistique
  { value: 'transport', label: 'Transport', category: 'Transport & Logistique' },
  { value: 'logistics', label: 'Logistique', category: 'Transport & Logistique' },
  { value: 'shipping', label: 'Transport maritime', category: 'Transport & Logistique' },
  { value: 'air_transport', label: 'Transport aérien', category: 'Transport & Logistique' },
  { value: 'delivery', label: 'Livraison', category: 'Transport & Logistique' },

  // Autres
  { value: 'other', label: 'Autre', category: 'Autres' }
];

// Fonction utilitaire pour grouper les secteurs par catégorie
export function getBusinessSectorsByCategory() {
  return BUSINESS_SECTORS.reduce((acc, sector) => {
    if (!acc[sector.category]) {
      acc[sector.category] = [];
    }
    acc[sector.category].push(sector);
    return acc;
  }, {} as Record<string, BusinessSector[]>);
}