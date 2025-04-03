export interface Product {
  _id: string;
  userId: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  media: Array<{
    url: string;
    caption: string;
  }>;
  views: Array<{
    userId: string;
    viewedAt: string;
    viewCount: number;
  }>;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
}