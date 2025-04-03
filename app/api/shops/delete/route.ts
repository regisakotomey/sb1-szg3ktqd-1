import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Shop } from '@/models/Shop';
import { Notification } from '@/models/Notification';

export async function DELETE(req: Request) {
  try {
    const { shopId, userId } = await req.json();
    console.log("place id : ", shopId);
    await connectDB();

    // Verify shop exists and belongs to user
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

    // Get list of users who follow this shop before deletion
    const followers = shop.followers.map(follower => follower.userId);

    // Soft delete
    await Shop.findByIdAndUpdate(shopId, {
      isDeleted: true,
      deletedAt: new Date()
    });

    // Create notification for each follower
    if (followers.length > 0) {
      const notifications = followers.map(followerId => ({
        userId: followerId,
        actorId: userId,
        actorType: 'user',
        contentType: 'shop',
        contentId: shop._id,
        contentTitle: shop.name,
        reason: 'content_deleted',
        imageUrl: shop.logo || null,
        link: `/content/shops/${shop._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression boutique:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}