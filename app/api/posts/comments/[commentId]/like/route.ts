import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PostComment } from '@/models/PostComment';
import { Notification } from '@/models/Notification';
import { Post } from '@/models/Post';

export async function POST(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const { userId } = await req.json();
    
    await connectDB();

    const comment = await PostComment.findByIdAndUpdate(
      params.commentId,
      {
        $addToSet: { 
          likes: {
            userId,
            likedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!comment) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }

    // Get post and comment author info for notification
    const post = await Post.findById(comment.postId);
    if (post && comment.userId.toString() !== userId) {
      // Create notification for comment author
      await Notification.create({
        userId: comment.userId,
        actorId: userId,
        actorType: 'user',
        contentType: 'post',
        contentId: post._id,
        contentTitle: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        reason: 'content_liked',
        imageUrl: post.media[0], // First media as preview if available
        link: `/posts/${post._id}`,
        read: false,
        createdAt: new Date()
      });
    }

    return NextResponse.json({ 
      likes: comment.likes.length,
      isLiked: true
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const { userId } = await req.json();
    
    await connectDB();

    const comment = await PostComment.findByIdAndUpdate(
      params.commentId,
      {
        $pull: { 
          likes: { userId }
        }
      },
      { new: true }
    );

    if (!comment) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      likes: comment.likes.length,
      isLiked: false
    });
  } catch (error) {
    console.error('Error unliking comment:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}