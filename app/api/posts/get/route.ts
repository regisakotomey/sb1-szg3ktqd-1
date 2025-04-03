'use client';

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import { User } from '@/models/User';
import { PostComment } from '@/models/PostComment';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('currentUserId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    await connectDB();

    // Get current user's following and followers lists
    const currentUser = currentUserId ? await User.findById(currentUserId) : null;
    const followingIds = currentUser?.following?.map(f => f.userId.toString()) || [];
    const followerIds = currentUser?.followers?.map(f => f.userId.toString()) || [];

    // Get ALL posts that aren't deleted (no skip/limit yet)
    const posts = await Post.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();

    // Get user info and calculate priority for all posts
    const postsWithUserInfo = await Promise.all(
      posts.map(async (post) => {
        const author = await User.findById(post.userId);
        if (!author) return null;

        // Calculate post priority
        let priority = 0;

        // Check mutual follow status
        const isFollowing = followingIds.includes(author._id.toString());
        const isFollower = followerIds.includes(author._id.toString());

        // Priority levels:
        // 4: Mutual follow (user follows author and author follows user)
        // 3: User follows author but author doesn't follow user
        // 2: Author follows user but user doesn't follow author
        // 1: No follow relationship
        if (isFollowing && isFollower) {
          priority = 100;
        } else if (isFollowing) {
          priority = 85;
        } else if (isFollower) {
          priority = 70;
        } else {
          priority = 40;
        }

        // Add recency factor (0-100 points)
        const ageInHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
        const recencyScore = Math.max(0, 100 - ageInHours);
        //priority += recencyScore;

        if (page == 1){
          // Check if current user has viewed this post
          const userViews = currentUserId ? 
          post.views.find(v => v.userId.toString() === currentUserId) : 
          null;

          
          // Reduce priority based on view count
          if (userViews) {
            
            if (isFollowing && isFollower) {
              priority = Math.max(0, priority - (userViews.viewCount * 25));
            } else if (isFollowing) {
              priority = Math.max(0, priority - (userViews.viewCount * 21.25));
            } else if (isFollower) {
              priority = Math.max(0, priority - (userViews.viewCount * 17.5));
            } else {
              priority = Math.max(0, priority - (userViews.viewCount * 10));
            }
          }
        }

        // Get comment count for this post
        const commentCount = await PostComment.countDocuments({ postId: post._id });

        return {
          ...post,
          priority,
          commentCount,
          author: {
            id: author._id,
            name: author.firstName && author.lastName 
              ? `${author.firstName} ${author.lastName}`
              : 'Utilisateur',
            avatar: author.avatar,
            followers: author.followers?.length || 0,
            isFollowed: currentUserId ? followingIds.includes(author._id.toString()) : false,
            followsYou: currentUserId ? followerIds.includes(author._id.toString()) : false
          }
        };
      })
    );

    // Filter out null values and sort by priority
    const sortedPosts = postsWithUserInfo
      .filter(post => post !== null)
      .sort((a, b) => b.priority - a.priority);

    // Apply pagination AFTER sorting
    const total = sortedPosts.length;
    const paginatedPosts = sortedPosts.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      posts: paginatedPosts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}