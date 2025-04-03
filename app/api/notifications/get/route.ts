import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Notification } from '@/models/Notification';
import { User } from '@/models/User';
import { Event } from '@/models/Event';
import { Place } from '@/models/Place';
import { Opportunity } from '@/models/Opportunity';
import { Shop } from '@/models/Shop';
import { Product } from '@/models/Product';
import { Post } from '@/models/Post';

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

    // Get actor info for each notification
    const notificationsWithDetails = await Promise.all(
      notifications.map(async (notification) => {
        let actor;
        if (notification.actorType === 'user') {
          actor = await User.findById(notification.actorId);
        } else if (notification.actorType === 'place') {
          actor = await Place.findById(notification.actorId);
        }
        
        // Get content details based on type
        let contentTitle = notification.contentTitle;
        let imageUrl = notification.imageUrl;
        
        switch (notification.contentType) {
          case 'event': {
            const event = await Event.findById(notification.contentId);
            if (event) {
              contentTitle = event.title;
              imageUrl = event.mainMedia;
            }
            break;
          }
          case 'place': {
            const place = await Place.findById(notification.contentId);
            if (place) {
              contentTitle = place.name;
              imageUrl = place.mainImage;
            }
            break;
          }
          case 'opportunity': {
            const opportunity = await Opportunity.findById(notification.contentId);
            if (opportunity) {
              contentTitle = opportunity.title;
              imageUrl = opportunity.mainImage;
            }
            break;
          }
          case 'shop': {
            const shop = await Shop.findById(notification.contentId);
            if (shop) {
              contentTitle = shop.name;
              imageUrl = shop.logo;
            }
            break;
          }
          case 'product': {
            const product = await Product.findById(notification.contentId);
            if (product) {
              contentTitle = product.name;
              imageUrl = product.media[0]?.url;
            }
            break;
          }
          case 'post': {
            const post = await Post.findById(notification.contentId);
            if (post) {
              contentTitle = post.content?.substring(0, 100) || '';
              imageUrl = post.media[0];
            }
            break;
          }
          case 'user': {
            const user = await User.findById(notification.contentId);
            if (user) {
              contentTitle = user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : 'Utilisateur';
              imageUrl = user.avatar;
            }
            break;
          }
        }

        // Construire le lien de redirection
        let link = notification.link;
        if (!link) {
          switch (notification.contentType) {
            case 'event':
              link = `/content/events/${notification.contentId}`;
              break;
            case 'place':
              link = `/content/places/${notification.contentId}`;
              break;
            case 'opportunity':
              link = `/content/opportunities/${notification.contentId}`;
              break;
            case 'shop':
              link = `/content/shops/${notification.contentId}`;
              break;
            case 'product':
              link = `/content/marketplace/${notification.contentId}`;
              break;
            case 'post':
              link = `/posts/${notification.contentId}`;
              break;
            case 'user':
              link = `/profile/${notification.contentId}`;
              break;
          }
        }

        return {
          id: notification._id,
          actorId: notification.actorId,
          actorType: notification.actorType,
          contentType: notification.contentType,
          contentId: notification.contentId,
          contentTitle,
          reason: notification.reason,
          imageUrl: notification.imageUrl || imageUrl,
          link: notification.link || link,
          read: notification.read,
          createdAt: notification.createdAt,
          actor: {
            name: actor ? (
              notification.actorType === 'user' 
                ? `${actor.firstName} ${actor.lastName}` 
                : actor.name
            ) : 'Utilisateur',
            avatar: actor?.avatar || null
          }
        };
      })
    );

    return NextResponse.json({ notifications: notificationsWithDetails });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}