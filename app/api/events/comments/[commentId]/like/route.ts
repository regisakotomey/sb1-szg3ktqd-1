import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { EventComment } from '@/models/EventComment';

export async function POST(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const { userId } = await req.json();
    
    await connectDB();

    const comment = await EventComment.findByIdAndUpdate(
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

    const comment = await EventComment.findByIdAndUpdate(
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