export interface Shop {
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
  description: string;
  logo?: string;
  countries: string[];
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