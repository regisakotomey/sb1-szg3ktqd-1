export interface SearchResult {
  id: string;
  type: 'event' | 'place' | 'opportunity' | 'shop' | 'product' | 'user' | 'ad';
  title: string;
  description?: string;
  image?: string;
  date?: string;
  location?: string;
  price?: number;
  score: number;
  url: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}