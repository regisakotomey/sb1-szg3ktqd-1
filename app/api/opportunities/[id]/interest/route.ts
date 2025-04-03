import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Opportunity } from '@/models/Opportunity';
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
    const user = await User.findById(userId);
    if (!user || !user.isVerified) {
      return NextResponse.json(
        { error: 'Utilisateur non autorisé' },
        { status: 403 }
      );
    }

    // Get opportunity and verify it exists
    const opportunity = await Opportunity.findById(params.id);
    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunité non trouvée' },
        { status: 404 }
      );
    }

    // Add interest
    const updatedOpportunity = await Opportunity.findByIdAndUpdate(
      params.id,
      {
        $addToSet: { 
          interests: {
            userId,
            interestedAt: new Date()
          }
        }
      },
      { new: true }
    );

    // Create notification for opportunity organizer
    await Notification.create({
      userId: opportunity.organizer.id, // The opportunity organizer will receive the notification
      actorId: userId, // The user who showed interest
      actorType: 'user',
      contentType: 'opportunity',
      contentId: opportunity._id,
      contentTitle: opportunity.title,
      reason: 'content_followed',
      imageUrl: opportunity.mainImage,
      link: `/content/opportunities/${opportunity._id}`,
      read: false,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding interest:', error);
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

    // Remove interest
    const opportunity = await Opportunity.findByIdAndUpdate(
      params.id,
      {
        $pull: { 
          interests: { userId }
        }
      },
      { new: true }
    );

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunité non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing interest:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}