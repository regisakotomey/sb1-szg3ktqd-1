export interface Place {
  _id: string;
  organizer: {
    type: 'user' | 'place';
    id: string;
    name?: string;
    followers?: number;
    isFollowed?: boolean;
  };
  type: string;
  name: string;
  shortDescription: string;
  description: string;
  longDescription?: string;
  services?: string;
  logo?: string;
  mainImage: string;
  additionalImages?: string[];
  country: string;
  coordinates?: string;
  locationDetails: string;
  openingHours: Array<{
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }>;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  views: Array<{
    userId: string;
    viewedAt: string;
    viewCount: number;
  }>;
  followers: Array<{
    userId: string;
    followedAt: string;
  }>;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
}