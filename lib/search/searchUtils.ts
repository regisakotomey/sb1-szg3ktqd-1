// Fonction pour normaliser le texte (retirer accents et mettre en minuscule)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Fonction pour calculer la distance entre deux positions dans un texte
function calculateDistance(pos1: number, pos2: number): number {
  return Math.abs(pos1 - pos2);
}

// Fonction pour trouver toutes les positions d'un mot dans un texte
function findWordPositions(text: string, word: string): number[] {
  const positions: number[] = [];
  let pos = text.indexOf(word);
  while (pos !== -1) {
    positions.push(pos);
    pos = text.indexOf(word, pos + 1);
  }
  return positions;
}

// Fonction pour calculer le score de proximité entre les mots
function calculateProximityScore(text: string, searchWords: string[]): number {
  const normalizedText = normalizeText(text);
  const wordPositions = searchWords.map(word => findWordPositions(normalizedText, word));
  
  // Si un des mots n'est pas trouvé, retourner 0
  if (wordPositions.some(positions => positions.length === 0)) {
    return 0;
  }

  // Calculer toutes les combinaisons possibles de positions
  let minTotalDistance = Infinity;
  const firstWordPositions = wordPositions[0];

  for (const pos1 of firstWordPositions) {
    let maxDistance = 0;
    let validCombination = true;
    let lastPosition = pos1;

    for (let i = 1; i < wordPositions.length; i++) {
      // Trouver la position la plus proche du mot suivant
      const positions = wordPositions[i];
      let minDistance = Infinity;
      let bestPosition = -1;

      for (const pos of positions) {
        const distance = calculateDistance(lastPosition, pos);
        if (distance < minDistance) {
          minDistance = distance;
          bestPosition = pos;
        }
      }

      if (bestPosition === -1) {
        validCombination = false;
        break;
      }

      maxDistance = Math.max(maxDistance, minDistance);
      lastPosition = bestPosition;
    }

    if (validCombination) {
      minTotalDistance = Math.min(minTotalDistance, maxDistance);
    }
  }

  // Calculer le score final
  if (minTotalDistance === Infinity) {
    return 0;
  }

  // Plus la distance est petite, plus le score est élevé
  const proximityScore = 1 / (1 + minTotalDistance);
  
  // Bonus pour les correspondances exactes de phrases
  const exactPhraseBonus = normalizedText.includes(searchWords.join(' ')) ? 2 : 1;
  
  // Bonus pour l'ordre des mots
  const orderBonus = isWordsInOrder(normalizedText, searchWords) ? 1.5 : 1;

  return proximityScore * exactPhraseBonus * orderBonus;
}

// Vérifie si les mots apparaissent dans l'ordre dans le texte
function isWordsInOrder(text: string, words: string[]): boolean {
  let lastIndex = -1;
  for (const word of words) {
    const index = text.indexOf(word);
    if (index === -1 || index < lastIndex) {
      return false;
    }
    lastIndex = index;
  }
  return true;
}

export function calculateRelevanceScore(query: string, text: string | undefined, weight: number = 1): number {
  if (!text) return 0;
  
  // Normaliser la requête et le texte
  const normalizedQuery = normalizeText(query);
  const searchWords = normalizedQuery.split(/\s+/).filter(word => word.length > 1);
  
  if (searchWords.length === 0) return 0;

  // Calculer le score de proximité
  const proximityScore = calculateProximityScore(text, searchWords);
  
  // Facteurs supplémentaires de pertinence
  const titleBonus = weight > 1 ? 1.5 : 1; // Bonus pour les titres
  const lengthPenalty = 1 / Math.log(text.length + 2); // Pénalité pour les textes très longs
  
  return proximityScore * titleBonus * lengthPenalty * weight * 100;
}

export function getSearchUrl(type: string, id: string): string {
  switch (type) {
    case 'event':
      return `/content/events/${id}`;
    case 'place':
      return `/content/places/${id}`;
    case 'opportunity':
      return `/content/opportunities/${id}`;
    case 'shop':
      return `/content/shops/${id}`;
    case 'product':
      return `/content/marketplace/${id}`;
    case 'user':
      return `/profile/${id}`;
    case 'ad':
      return `/content/ads/${id}`;
    default:
      return '/';
  }
}