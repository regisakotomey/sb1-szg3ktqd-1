import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PlaceComment } from '@/models/PlaceComment';
import { User } from '@/models/User';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const comments = await PlaceComment.find({ placeId: params.id })
      .sort({ createdAt: -1 })
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
              : 'Utilisateur'
          }
        };
      })
    );

    return NextResponse.json({ comments: commentsWithUser });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, content } = await req.json();
    
    await connectDB();

    const comment = await PlaceComment.create({
      userId,
      placeId: params.id,
      content
    });

    const user = await User.findById(userId);

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
          : 'Utilisateur'
      }
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}