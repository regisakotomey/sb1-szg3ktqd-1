import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Conversation } from '@/models/Conversation';
import { User } from '@/models/User';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get all conversations for user
    const conversations = await Conversation.find({
      participants: userId
    }).sort({ 'lastMessage.timestamp': -1 });

    // Get user info for each conversation
    const conversationsWithUserInfo = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.participants.find(
          (p: any) => p.toString() !== userId
        );
        const otherUser = await User.findById(otherUserId);

        return {
          id: conv._id,
          user: {
            id: otherUser._id,
            name: otherUser.firstName && otherUser.lastName 
              ? `${otherUser.firstName} ${otherUser.lastName}`
              : 'Utilisateur',
            avatar: null,
            online: false,
            lastSeen: 'Hors ligne'
          },
          lastMessage: conv.lastMessage ? {
            text: conv.lastMessage.content,
            time: conv.lastMessage.timestamp,
            unread: false
          } : {
            text: 'Nouvelle conversation',
            time: conv.createdAt,
            unread: false
          }
        };
      })
    );

    return NextResponse.json({ conversations: conversationsWithUserInfo });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}