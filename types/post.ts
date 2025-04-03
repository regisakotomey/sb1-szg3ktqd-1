export interface Post {
  _id: string;
  userId: string;
  content: string;
  media: string[];
  createdAt: string;
  views: Array<{
    userId: string;
    viewedAt: string;
    viewCount: number;
  }>;
  likes: Array<{
    userId: string;
    likedAt: string;
  }>;
  comments: Array<{
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
      avatar?: string | null;
    };
  }>;
  commentCount: number;
  author?: {
    id: string;
    name: string;
    avatar: string | null;
    followers: number;
    isFollowed: boolean;
    followsYou?: boolean;
  };
  priority?: number;
  isDeleted?: boolean;
  deletedAt?: string | null;
}