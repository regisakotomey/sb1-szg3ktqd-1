import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Notification } from '@/models/Notification';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json();
    
    await connectDB();

    // Verify user exists and is verified
    const follower = await User.findById(userId);
    if (!follower || !follower.isVerified) {
      return NextResponse.json(
        { error: 'Utilisateur non autorisé' },
        { status: 403 }
      );
    }

    // Add follower to target user's followers list
    const user = await User.findByIdAndUpdate(
      params.id,
      {
        $addToSet: { 
          followers: {
            userId,
            followedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Add target user to follower's following list
    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          following: {
            userId: params.id,
            followedAt: new Date()
          }
        }
      }
    );

    // Create notification for the user being followed
    await Notification.create({
      userId: params.id, // The user being followed
      actorId: userId, // The user who followed
      contentType: 'user',
      contentId: params.id,
      reason: 'content_followed',
      imageUrl: follower.avatar || null,
      link: `/userprofile/${userId}`,
      read: false,
      createdAt: new Date()
    });

    return NextResponse.json({ 
      success: true,
      followers: user.followers.length,
      isFollowed: true
    });
  } catch (error) {
    console.error('Error adding follower:', error);
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

    // Remove follower from target user's followers list
    const user = await User.findByIdAndUpdate(
      params.id,
      {
        $pull: { 
          followers: { userId }
        }
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Remove target user from follower's following list
    await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          following: { userId: params.id }
        }
      }
    );

    return NextResponse.json({ 
      success: true,
      followers: user.followers.length,
      isFollowed: false
    });
  } catch (error) {
    console.error('Error removing follower:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}