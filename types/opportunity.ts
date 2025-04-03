export interface Opportunity {
  _id: string;
  organizer: {
    type: 'user' | 'place';
    id: string;
    name?: string;
    followers?: number;
    isFollowed?: boolean;
  };
  type: string;
  title: string;
  description: string;
  mainImage: string;
  additionalImages?: string[];
  country: string;
  coordinates?: string;
  locationDetails: string;
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
  interests: Array<{
    userId: string;
    interestedAt: string;
  }>;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
}