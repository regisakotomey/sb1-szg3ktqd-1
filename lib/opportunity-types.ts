export interface OpportunityType {
  value: string;
  label: string;
  category: string;
}

// Utility functions
export function getOpportunityTypeLabel(value: string): string {
  const oppotunityType = OPPORTUNITY_TYPES.find(type => type.value === value);
  return oppotunityType?.label || value;
}

export const OPPORTUNITY_TYPES: OpportunityType[] = [
  // Emploi
  { value: 'full_time', label: 'CDI', category: 'Emploi' },
  { value: 'part_time', label: 'CDD', category: 'Emploi' },
  { value: 'temporary', label: 'Intérim', category: 'Emploi' },
  { value: 'apprenticeship', label: 'Alternance', category: 'Emploi' },
  { value: 'seasonal', label: 'Emploi saisonnier', category: 'Emploi' },
  { value: 'remote', label: 'Télétravail', category: 'Emploi' },
  { value: 'hybrid', label: 'Hybride', category: 'Emploi' },

  // Stage
  { value: 'internship_short', label: 'Stage court (1-2 mois)', category: 'Stage' },
  { value: 'internship_medium', label: 'Stage moyen (3-4 mois)', category: 'Stage' },
  { value: 'internship_long', label: 'Stage long (6 mois et +)', category: 'Stage' },
  { value: 'internship_summer', label: 'Stage d\'été', category: 'Stage' },
  { value: 'internship_abroad', label: 'Stage à l\'étranger', category: 'Stage' },

  // Freelance & Consulting
  { value: 'freelance_project', label: 'Projet freelance', category: 'Freelance & Consulting' },
  { value: 'consulting', label: 'Mission de conseil', category: 'Freelance & Consulting' },
  { value: 'contract_work', label: 'Prestation de service', category: 'Freelance & Consulting' },
  { value: 'outsourcing', label: 'Externalisation', category: 'Freelance & Consulting' },

  // Partenariat
  { value: 'business_partnership', label: 'Partenariat commercial', category: 'Partenariat' },
  { value: 'strategic_alliance', label: 'Alliance stratégique', category: 'Partenariat' },
  { value: 'joint_venture', label: 'Joint-venture', category: 'Partenariat' },
  { value: 'distribution', label: 'Distribution', category: 'Partenariat' },
  { value: 'franchise', label: 'Franchise', category: 'Partenariat' },
  { value: 'licensing', label: 'Licence', category: 'Partenariat' },
  { value: 'white_label', label: 'Marque blanche', category: 'Partenariat' },

  // Investissement
  { value: 'seed_funding', label: 'Amorçage', category: 'Investissement' },
  { value: 'series_a', label: 'Série A', category: 'Investissement' },
  { value: 'series_b', label: 'Série B', category: 'Investissement' },
  { value: 'growth_capital', label: 'Capital développement', category: 'Investissement' },
  { value: 'angel_investment', label: 'Investissement angel', category: 'Investissement' },
  { value: 'venture_capital', label: 'Capital-risque', category: 'Investissement' },
  { value: 'private_equity', label: 'Capital-investissement', category: 'Investissement' },
  { value: 'crowdfunding', label: 'Financement participatif', category: 'Investissement' },

  // Formation
  { value: 'mentoring', label: 'Mentorat', category: 'Formation' },
  { value: 'coaching', label: 'Coaching', category: 'Formation' },
  { value: 'training', label: 'Formation professionnelle', category: 'Formation' },
  { value: 'workshop', label: 'Atelier', category: 'Formation' },
  { value: 'certification', label: 'Certification', category: 'Formation' },

  // Recherche & Innovation
  { value: 'research_project', label: 'Projet de recherche', category: 'Recherche & Innovation' },
  { value: 'innovation_program', label: 'Programme d\'innovation', category: 'Recherche & Innovation' },
  { value: 'incubation', label: 'Incubation', category: 'Recherche & Innovation' },
  { value: 'acceleration', label: 'Accélération', category: 'Recherche & Innovation' },
  { value: 'rd_partnership', label: 'Partenariat R&D', category: 'Recherche & Innovation' },

  // Autres
  { value: 'other', label: 'Autre', category: 'Autres' }
];

// Fonction utilitaire pour grouper les types par catégorie
export function getOpportunityTypesByCategory() {
  return OPPORTUNITY_TYPES.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, OpportunityType[]>);
}