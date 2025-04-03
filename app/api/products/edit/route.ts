import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import { User } from '@/models/User';
import { Shop } from '@/models/Shop';
import { Notification } from '@/models/Notification';
import { uploadMedia } from '@/lib/media';

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const productId = formData.get('productId') as string;
    const userId = formData.get('userId') as string;
    const shopId = formData.get('shopId') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const mediaFiles = formData.getAll('media') as File[];
    const currentMedia = JSON.parse(formData.get('currentMedia') as string);

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

    // Get product to verify it exists and belongs to user
    const product = await Product.findOne({ 
      _id: productId,
      userId,
      shopId,
      isDeleted: { $ne: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé ou non autorisé' },
        { status: 404 }
      );
    }

    // Get shop to verify it exists and get followers
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return NextResponse.json(
        { error: 'Boutique non trouvée' },
        { status: 404 }
      );
    }

    // Upload new media files
    const newMediaUrls = await Promise.all(
      mediaFiles.map(async file => ({
        url: await uploadMedia(file, 'products'),
        caption: ''
      }))
    );

    // Combine current and new media
    const media = [
      ...currentMedia.map((url: string) => ({ url, caption: '' })),
      ...newMediaUrls
    ];

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        price,
        media
      },
      { new: true }
    );

    // Create notifications for shop followers
    if (shop.followers && shop.followers.length > 0) {
      const notifications = shop.followers.map(follower => ({
        userId: follower.userId,
        actorId: shop.organizer.id,
        actorType: shop.organizer.type,
        contentType: 'product',
        contentId: product._id,
        contentTitle: product.name,
        reason: 'content_updated',
        imageUrl: media[0].url,
        link: `/content/marketplace/${product._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}