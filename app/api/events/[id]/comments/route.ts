import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { EventComment } from '@/models/EventComment';
import { User } from '@/models/User';
import { Event } from '@/models/Event';
import { Notification } from '@/models/Notification';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const comments = await EventComment.find({ eventId: params.id })
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

    // Get event details first
    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    // Create the comment
    const comment = await EventComment.create({
      userId,
      eventId: params.id,
      content
    });

    const user = await User.findById(userId);

    // Get all unique users who have commented on this event (excluding the current commenter)
    const existingComments = await EventComment.find({ eventId: params.id });
    const uniqueCommenterIds = existingComments
      .map(comment => comment.userId.toString())
      .filter(id => id !== userId && id !== event.organizer.id.toString());
    
    // Remove duplicates using Array.from(new Set())
    const uniqueCommenters = Array.from(new Set(uniqueCommenterIds));

    // Create notifications
    const notifications = [];

    // Notification for the event organizer (if not the commenter)
    if (event.organizer.id.toString() !== userId) {
      notifications.push({
        userId: event.organizer.id,
        actorId: userId,
        contentType: 'event',
        contentId: event._id,
        contentTitle: event.title,
        reason: 'content_commented',
        imageUrl: event.mainMedia,
        link: `/content/events/${event._id}`,
        read: false,
        createdAt: new Date()
      });
    }

    // Notifications for other commenters
    uniqueCommenters.forEach(commenterId => {
      notifications.push({
        userId: commenterId,
        actorId: userId,
        contentType: 'event',
        contentId: event._id,
        contentTitle: event.title,
        reason: 'content_commented',
        imageUrl: event.mainMedia,
        link: `/content/events/${event._id}`,
        read: false,
        createdAt: new Date()
      });
    });

    // Insert all notifications
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

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