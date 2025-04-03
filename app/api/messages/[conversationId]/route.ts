import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Message } from '@/models/Message';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    await connectDB();

    const messages = await Message.find({
      conversationId: params.conversationId
    })
      .sort({ createdAt: 1 })
      .lean();

    const formattedMessages = messages.map(message => ({
      id: message._id,
      sender: message.sender,
      text: message.content,
      time: format(new Date(message.createdAt), 'HH:mm', { locale: fr })
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}