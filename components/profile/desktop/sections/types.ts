// Types communs pour les sections
export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  type?: string;
  date?: string;
  price?: number;
  location?: string;
}

export interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: string;
  country_code: string;
  sector?: string;
  followers: number;
  following: number;
  isFollowed: boolean;
}

export interface Follower {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  isFollowing: boolean;
  followedAt: string;
}

export type ContentType = 'posts' | 'events' | 'places' | 'opportunities' | 'shops';
export type InteractionType = 'likes' | 'comments';