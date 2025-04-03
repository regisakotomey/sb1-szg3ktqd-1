import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import { Notification } from '@/models/Notification';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json();
    
    await connectDB();

    const post = await Post.findByIdAndUpdate(
      params.id,
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

    if (!post) {
      return NextResponse.json(
        { error: 'Post non trouvé' },
        { status: 404 }
      );
    }

    // Create notification for post author if liker is not the author
    if (post.userId.toString() !== userId) {
      await Notification.create({
        userId: post.userId, // Post author will receive the notification
        actorId: userId, // User who liked the post
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
      likes: post.likes.length,
      isLiked: true
    });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json();
    
    await connectDB();

    const post = await Post.findByIdAndUpdate(
      params.id,
      {
        $pull: { 
          likes: { userId }
        }
      },
      { new: true }
    );

    if (!post) {
      return NextResponse.json(
        { error: 'Post non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      likes: post.likes.length,
      isLiked: false
    });
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}