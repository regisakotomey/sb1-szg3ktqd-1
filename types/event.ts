export interface Event {
  _id: string;
  organizer: {
    type: 'user' | 'place';
    id: string;
    name?: string;
    followers?: number;
    isFollowed?: boolean;
  };
  title: string;
  type: string;
  description: string;
  startDate: string;
  endDate: string;
  mainMedia: string;
  additionalMedia?: string[];
  country: string;
  coordinates?: string;
  address: string;
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