import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdSpot } from '@/models/AdSpot';
import { User } from '@/models/User';
import { Place } from '@/models/Place';
import { Shop } from '@/models/Shop';
import { Notification } from '@/models/Notification';
import { uploadMedia } from '@/lib/media';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const placeId = formData.get('placeId') as string;
    const shopId = formData.get('shopId') as string;
    const mediaFiles = formData.getAll('media') as File[];
    
    // Get all captions
    const captions: string[] = [];
    for (let i = 0; i < mediaFiles.length; i++) {
      const caption = formData.get(`captions[${i}]`);
      captions.push(caption ? caption.toString() : '');
    }

    await connectDB();

    // Verify user exists and is verified
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Compte non vérifié' },
        { status: 403 }
      );
    }

    // Upload media files
    const mediaUrls = await Promise.all(
      mediaFiles.map(file => uploadMedia(file, 'ads'))
    );

    // Create media array with URLs and captions
    const media = mediaUrls.map((url, index) => ({
      url,
      caption: captions[index] || ''
    }));

    // Create ad spot
    const adSpot = await AdSpot.create({
      userId,
      placeId: placeId || undefined,
      shopId: shopId || undefined,
      media
    });

    // Get followers to notify based on whether the ad spot was created by a place or shop
    let followers = [];
    let creator;
    let creatorType;

    if (placeId) {
      // If ad spot is created by a place, notify place followers
      const place = await Place.findById(placeId);
      if (place) {
        followers = place.followers.map(follower => ({
          _id: follower.userId
        }));
        creator = {
          id: place._id,
          name: place.name,
          type: place.type
        };
        creatorType = 'place';
      }
    } else if (shopId) {
      // If ad spot is created by a shop, notify shop followers
      const shop = await Shop.findById(shopId);
      if (shop) {
        followers = shop.followers.map(follower => ({
          _id: follower.userId
        }));
        creator = {
          id: shop._id,
          name: shop.name,
          type: shop.type
        };
        creatorType = 'place';
      }
    }

    // Create notifications for followers
    if (followers.length > 0) {
      const notifications = followers.map(follower => ({
        userId: follower._id,
        actorId: placeId || shopId,
        actorType: creatorType,
        contentType: 'ad',
        contentId: adSpot._id,
        contentTitle: media[0].caption || 'Nouveau spot publicitaire',
        reason: 'new_content',
        imageUrl: media[0].url,
        link: `/content/ads/${adSpot._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json(adSpot, { status: 201 });
  } catch (error) {
    console.error('Error creating ad spot:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}