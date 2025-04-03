import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Message } from '@/models/Message';
import { Conversation } from '@/models/Conversation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function POST(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { userId, recipientId, content } = await req.json();
    let conversationId = params.conversationId;

    await connectDB();

    // If conversationId is 'new', create new conversation
    if (conversationId === 'new') {
      // Check if conversation already exists between these users
      const existingConversation = await Conversation.findOne({
        participants: { 
          $all: [userId, recipientId],
          $size: 2 // Ensure exactly these two participants
        }
      });

      if (existingConversation) {
        conversationId = existingConversation._id.toString();
      } else {
        // Create new conversation
        const newConversation = await Conversation.create({
          participants: [userId, recipientId]
        });
        conversationId = newConversation._id.toString();
      }
    }

    // Create message
    const message = await Message.create({
      conversationId,
      sender: userId,
      content
    });

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        sender: userId,
        content,
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      id: message._id,
      conversationId,
      sender: message.sender,
      text: message.content,
      time: format(message.createdAt, 'HH:mm', { locale: fr })
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}