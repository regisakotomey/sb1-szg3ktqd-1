import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Shop } from '@/models/Shop';
import { User } from '@/models/User';
import { Notification } from '@/models/Notification';
import { uploadMedia } from '@/lib/media';

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const shopId = formData.get('shopId') as string;
    const userId = formData.get('userId') as string;
    const type = formData.get('type') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const logo = formData.get('logo') as File | null;
    const countries = formData.getAll('countries[]') as string[];
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const website = formData.get('website') as string;
    const currentLogo = formData.get('currentLogo') as string;

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

    // Verify if shop exists and belongs to user
    const shop = await Shop.findOne({ 
      _id: shopId,
      'organizer.type': 'user',
      'organizer.id': userId,
      isDeleted: { $ne: true }
    });

    if (!shop) {
      return NextResponse.json(
        { error: 'Boutique non trouvée ou non autorisée' },
        { status: 404 }
      );
    }

    // Get followers before updating
    const followers = shop.followers.map(follower => follower.userId.toString());

    // Handle logo upload
    let logoUrl = currentLogo;
    if (logo) {
      logoUrl = await uploadMedia(logo, 'shops');
    }

    // Update shop
    const updatedShop = await Shop.findByIdAndUpdate(
      shopId,
      {
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
      },
      { new: true }
    );

    // Create notifications for followers
    if (followers.length > 0) {
      const notifications = followers.map(followerId => ({
        userId: followerId,
        actorId: userId,
        actorType: 'user',
        contentType: 'shop',
        contentId: shop._id,
        contentTitle: shop.name,
        reason: 'content_updated',
        imageUrl: logoUrl,
        link: `/content/shops/${shop._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json(updatedShop);
  } catch (error) {
    console.error('Error updating shop:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}