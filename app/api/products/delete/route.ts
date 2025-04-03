import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import { Notification } from '@/models/Notification';
import { Shop } from '@/models/Shop';

export async function DELETE(req: Request) {
  try {
    const { productId, userId } = await req.json();

    await connectDB();

    // Verify product exists and belongs to user
    const product = await Product.findOne({ 
      _id: productId,
      userId,
      isDeleted: { $ne: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé ou non autorisé' },
        { status: 404 }
      );
    }

    // Get shop to verify it exists and get followers
    const shop = await Shop.findById(product.shopId);
    if (!shop) {
      return NextResponse.json(
        { error: 'Boutique non trouvée' },
        { status: 404 }
      );
    }

    // Get list of users who have interacted with the product
    const interestedUsers = new Set([
      ...shop.followers.map(follower => follower.userId.toString())
    ]);

    // Remove the product owner from the notification list
    interestedUsers.delete(userId);

    // Soft delete the product
    await Product.findByIdAndUpdate(productId, {
      isDeleted: true,
      deletedAt: new Date()
    });

    // Create notifications for interested users
    if (interestedUsers.size > 0) {
      const notifications = Array.from(interestedUsers).map(interestedUserId => ({
        userId: interestedUserId,
        actorId: shop.organizer.id,
        actorType: shop.organizer.type,
        contentType: 'product',
        contentId: product._id,
        contentTitle: product.name,
        reason: 'content_deleted',
        imageUrl: product.media[0]?.url,
        link: `/content/marketplace/${product._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}