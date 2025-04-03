import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Conversation } from '@/models/Conversation';

export async function POST(req: Request) {
  try {
    const { userId, recipientId } = await req.json();

    await connectDB();

    // Check if users exist
    const [user, recipient] = await Promise.all([
      User.findById(userId),
      User.findById(recipientId)
    ]);

    if (!user || !recipient) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { 
        $all: [userId, recipientId],
        $size: 2 // Ensure exactly these two participants
      }
    });

    if (existingConversation) {
      // Return existing conversation info
      return NextResponse.json({
        recipient: {
          id: recipient._id,
          name: recipient.firstName && recipient.lastName 
            ? `${recipient.firstName} ${recipient.lastName}`
            : 'Utilisateur',
          avatar: null,
          online: false,
          lastSeen: 'Hors ligne'
        },
        conversation: {
          id: existingConversation._id,
          lastMessage: existingConversation.lastMessage
        }
      });
    }

    // Return only recipient info for new conversation
    return NextResponse.json({
      recipient: {
        id: recipient._id,
        name: recipient.firstName && recipient.lastName 
          ? `${recipient.firstName} ${recipient.lastName}`
          : 'Utilisateur',
        avatar: null,
        online: false,
        lastSeen: 'Hors ligne'
      }
    });
  } catch (error) {
    console.error('Error initializing conversation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}