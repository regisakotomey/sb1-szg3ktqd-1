import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Shop } from '@/models/Shop';
import { User } from '@/models/User';
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

    // Créer une notification pour chaque abonné
    const followers = await User.find({
      'following.userId': userId
    });

    const notifications = followers.map(follower => ({
      userId: follower._id,
      actorId: userId,
      contentType: 'shop',
      contentId: shop._id,
      contentTitle: shop.name,
      reason: 'new_content',
      imageUrl: logoUrl,
      link: `/content/shops/${shop._id}`
    }));

    if (notifications.length > 0) {
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