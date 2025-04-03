import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Shop } from '@/models/Shop';
import { User } from '@/models/User';
import { Place } from '@/models/Place';
import { Notification } from '@/models/Notification';
import { uploadMedia } from '@/lib/media';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const placeId = formData.get('placeId') as string;
    const type = formData.get('type') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const logo = formData.get('logo') as File | null;
    const countries = formData.getAll('countries[]') as string[];
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const website = formData.get('website') as string;

    await connectDB();

    // Vérifier si l'utilisateur existe et est vérifié
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

    // Upload logo if present
    let logoUrl = null;
    if (logo) {
      logoUrl = await uploadMedia(logo, 'shops');
    }

    // Create shop with organizer info
    const shop = await Shop.create({
      organizer: {
        type: placeId ? 'place' : 'user',
        id: placeId || userId
      },
      type,
      name,
      description,
      logo: logoUrl,
      countries,
      contact: {
        phone,
        email,
        website
      }
    });

    // Créer une notification pour les abonnés appropriés
    let followers = [];
    if (placeId) {
      // Si la boutique est créée par un lieu, notifier les abonnés du lieu
      const place = await Place.findById(placeId);
      if (place) {
        followers = place.followers.map(follower => ({
          _id: follower.userId
        }));
      }
    } else {
      // Si la boutique est créée par un utilisateur, notifier ses abonnés
      followers = await User.find(
        { 'following.userId': userId, _id: { $ne: userId } },
        { _id: 1 }
      ).lean();
    }

    // Créer les notifications
    if (followers.length > 0) {
      const notifications = followers.map(follower => ({
        userId: follower._id,
        actorId: placeId || userId,
        actorType: placeId ? 'place' : 'user',
        contentType: 'shop',
        contentId: shop._id,
        contentTitle: shop.name,
        reason: 'new_content',
        imageUrl: logoUrl,
        link: `/content/shops/${shop._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json(shop, { status: 201 });
  } catch (error) {
    console.error('Error creating shop:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}