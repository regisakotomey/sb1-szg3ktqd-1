'use client';

interface PostView {
  userId: string;
  viewCount: number;
}

interface Post {
  _id: string;
  userId: string;
  views: PostView[];
  createdAt: string;
}

interface Author {
  id: string;
  isFollowed: boolean;
}

export function calculatePostPriority(
  post: Post,
  currentUserId: string,
  author: Author | null
): number {
  let priority = 0;

  // Base priority from creation date (newer posts get higher priority)
  const ageInHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
  priority += Math.max(0, 100 - ageInHours); // Decreases over time, max 100 points

  // Followed author bonus (highest priority)
  if (author?.isFollowed) {
    priority += 200;
  }

  // View count penalty
  const userViews = post.views.find(view => view.userId === currentUserId);
  if (userViews) {
    // Reduce priority based on view count
    priority -= Math.min(50, userViews.viewCount * 10); // Max penalty of 50 points
  }

  return priority;
}

export function sortPostsByPriority(
  posts: Post[],
  currentUserId: string
): Post[] {
  return [...posts].sort((a, b) => {
    const priorityA = calculatePostPriority(a, currentUserId, a.author);
    const priorityB = calculatePostPriority(b, currentUserId, b.author);
    return priorityB - priorityA;
  });
}