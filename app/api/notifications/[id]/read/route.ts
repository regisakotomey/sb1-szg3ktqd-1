'use client';

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Notification } from '@/models/Notification';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json();
    
    await connectDB();

    // Verify notification exists and belongs to user
    const notification = await Notification.findOne({ 
      _id: params.id,
      userId
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification non trouvée' },
        { status: 404 }
      );
    }

    // Mark as read
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}