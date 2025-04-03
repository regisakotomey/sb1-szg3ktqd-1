import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/models/Event';
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

    // Get event and verify it exists
    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    // Add interest
    const updatedEvent = await Event.findByIdAndUpdate(
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

    // Create notification for event organizer
    await Notification.create({
      userId: event.organizer.id, // The event organizer will receive the notification
      actorId: userId, // The user who showed interest
      contentType: 'event',
      contentId: event._id,
      contentTitle: event.title,
      reason: 'content_followed',
      imageUrl: event.mainMedia,
      link: `/content/events/${event._id}`,
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
    const event = await Event.findByIdAndUpdate(
      params.id,
      {
        $pull: { 
          interests: { userId }
        }
      },
      { new: true }
    );

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
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