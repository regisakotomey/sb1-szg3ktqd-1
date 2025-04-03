import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import { Notification } from '@/models/Notification';

export async function DELETE(req: Request) {
  try {
    const { postId, userId } = await req.json();

    await connectDB();

    // Verify post exists and belongs to user
    const post = await Post.findOne({ 
      _id: postId, 
      userId,
      isDeleted: { $ne: true }
    });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post non trouvé ou non autorisé' },
        { status: 404 }
      );
    }

    // Get unique users who liked or commented on the post
    const interestedUsers = new Set([
      ...post.likes.map(like => like.userId.toString()),
      ...post.comments.map(comment => comment.userId.toString())
    ]);

    // Remove the post author from the notification list
    interestedUsers.delete(userId);

    // Soft delete the post
    await Post.findByIdAndUpdate(postId, {
      isDeleted: true,
      deletedAt: new Date()
    });

    // Create notifications for users who liked or commented
    if (interestedUsers.size > 0) {
      const notifications = Array.from(interestedUsers).map(interestedUserId => ({
        userId: interestedUserId,
        actorId: userId,
        actorType: 'user',
        contentType: 'post',
        contentId: post._id,
        contentTitle: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        reason: 'content_deleted',
        imageUrl: post.media[0], // First media as preview if available
        link: `/posts/${post._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}