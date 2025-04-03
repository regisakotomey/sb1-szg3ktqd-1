import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/models/Event';
import { Notification } from '@/models/Notification';

export async function DELETE(req: Request) {
  try {
    const { eventId, userId } = await req.json();

    await connectDB();

    // Verify event exists and belongs to user
    const event = await Event.findOne({ 
      _id: eventId,
      'organizer.type': 'user',
      'organizer.id': userId,
      isDeleted: { $ne: true }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé ou non autorisé' },
        { status: 404 }
      );
    }

    // Get list of interested users before deletion
    const interestedUsers = event.interests.map(interest => interest.userId);

    // Soft delete
    await Event.findByIdAndUpdate(eventId, {
      isDeleted: true,
      deletedAt: new Date()
    });

    // Create notification for each interested user
    if (interestedUsers.length > 0) {
      const notifications = interestedUsers.map(userId => ({
        userId,
        actorId: event.organizer.id,
        contentType: 'event',
        contentId: event._id,
        contentTitle: event.title,
        reason: 'content_deleted',
        imageUrl: event.mainMedia,
        link: `/content/events/${event._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}