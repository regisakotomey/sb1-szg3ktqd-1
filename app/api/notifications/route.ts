'use client';

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Notification } from '@/models/Notification';
import { User } from '@/models/User';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get notifications for user
    const notifications = await Notification.find({ 
      userId,
      isDeleted: { $ne: true }
    })
    .sort({ createdAt: -1 })
    .lean();

    // Get user info for each notification
    const notificationsWithUser = await Promise.all(
      notifications.map(async (notification) => {
        const user = await User.findById(notification.actorId);
        
        // Format notification content based on type
        let content = '';
        let target = '';
        let preview = '';
        let link = '';

        switch (notification.type) {
          case 'like':
            content = 'a aimé votre publication';
            target = notification.targetTitle || 'votre publication';
            link = `/posts/${notification.targetId}`;
            break;
          case 'follow':
            content = 'a commencé à vous suivre';
            link = `/profile/${notification.actorId}`;
            break;
          case 'message':
            content = 'vous a envoyé un message';
            preview = notification.preview || '';
            link = `/messages/${notification.targetId}`;
            break;
          case 'event':
            content = notification.content || 'Un événement que vous suivez commence bientôt';
            link = `/content/events/${notification.targetId}`;
            break;
          case 'place':
            content = notification.content || 'a publié une nouvelle offre';
            link = `/content/places/${notification.targetId}`;
            break;
          case 'opportunity':
            content = notification.content || 'Une nouvelle opportunité correspond à votre profil';
            link = `/content/opportunities/${notification.targetId}`;
            break;
          case 'shop':
            content = notification.content || 'a ajouté de nouveaux articles';
            link = `/content/shops/${notification.targetId}`;
            break;
          case 'product':
            content = notification.content || 'Un produit de votre liste de souhaits est en promotion';
            link = `/content/marketplace/${notification.targetId}`;
            break;
        }

        return {
          id: notification._id,
          type: notification.type,
          user: {
            name: user ? `${user.firstName} ${user.lastName}` : 'Utilisateur',
            avatar: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user ? `${user.firstName} ${user.lastName}` : 'Utilisateur')}&background=random`
          },
          content,
          target,
          preview,
          time: format(new Date(notification.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr }),
          read: notification.read,
          link
        };
      })
    );

    return NextResponse.json({ notifications: notificationsWithUser });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}