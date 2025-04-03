import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import { User } from '@/models/User';
import { PostComment } from '@/models/PostComment';
import { Notification } from '@/models/Notification';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const skip = (page - 1) * limit;

    await connectDB();

    const comments = await PostComment.find({ postId: params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get user info for each comment
    const commentsWithUser = await Promise.all(
      comments.map(async (comment) => {
        const user = await User.findById(comment.userId);
        return {
          id: comment._id,
          content: comment.content,
          createdAt: comment.createdAt,
          likes: comment.likes.length,
          isLiked: false, // Will be set on client side
          author: {
            id: user._id,
            name: user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}`
              : 'Utilisateur',
            avatar: user.avatar
          }
        };
      })
    );

    // Get total count for pagination
    const total = await PostComment.countDocuments({ postId: params.id });
    const hasMore = skip + comments.length < total;

    return NextResponse.json({
      comments: commentsWithUser,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore
      }
    });
  } catch (err) {
    console.error('Error fetching comments:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, content } = await request.json();
    
    await connectDB();

    // Get post to verify it exists
    const post = await Post.findById(params.id);
    if (!post) {
      return NextResponse.json(
        { error: 'Post non trouvé' },
        { status: 404 }
      );
    }

    // Create comment
    const comment = await PostComment.create({
      userId,
      postId: params.id,
      content
    });

    const user = await User.findById(userId);

    // Create notification for post author if commenter is not the author
    if (post.userId.toString() !== userId) {
      await Notification.create({
        userId: post.userId, // Post author will receive the notification
        actorId: userId, // User who commented
        actorType: 'user',
        contentType: 'post',
        contentId: post._id,
        contentTitle: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        reason: 'content_commented',
        imageUrl: post.media[0], // First media as preview if available
        link: `/posts/${post._id}`,
        read: false,
        createdAt: new Date()
      });
    }

    // Get all previous commenters for this post
    const previousComments = await PostComment.find({ 
      postId: params.id,
      userId: { $ne: userId } // Exclude current commenter
    }).distinct('userId');

    // Filter out the post author from the notification recipients
    const notificationRecipients = previousComments.filter(
      commenterId => commenterId.toString() !== post.userId.toString()
    );

    // Create notifications for other unique commenters
    if (notificationRecipients.length > 0) {
      const notifications = notificationRecipients.map(commenterId => ({
        userId: commenterId,
        actorId: userId,
        actorType: 'user',
        contentType: 'post',
        contentId: post._id,
        contentTitle: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        reason: 'content_commented',
        imageUrl: post.media[0], // First media as preview if available
        link: `/posts/${post._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    // Get total comment count
    const commentCount = await PostComment.countDocuments({ postId: params.id });

    return NextResponse.json({
      id: comment._id,
      content: comment.content,
      createdAt: comment.createdAt,
      likes: 0,
      isLiked: false,
      author: {
        id: user._id,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`
          : 'Utilisateur',
        avatar: user.avatar
      },
      commentCount // Include total comment count in response
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}