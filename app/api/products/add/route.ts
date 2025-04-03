import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import { User } from '@/models/User';
import { Shop } from '@/models/Shop';
import { Notification } from '@/models/Notification';
import { uploadMedia } from '@/lib/media';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const shopId = formData.get('shopId') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
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

    // Get shop to verify it exists and get followers
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return NextResponse.json(
        { error: 'Boutique non trouvée' },
        { status: 404 }
      );
    }

    // Upload media files
    const mediaUrls = await Promise.all(
      mediaFiles.map(file => uploadMedia(file, 'products'))
    );

    // Create media array with URLs and captions
    const media = mediaUrls.map((url, index) => ({
      url,
      caption: captions[index] || ''
    }));

    // Create product
    const product = await Product.create({
      userId,
      shopId,
      name,
      description,
      price,
      media
    });

    // Create notifications for shop followers
    if (shop.followers && shop.followers.length > 0) {
      const notifications = shop.followers.map(follower => ({
        userId: follower.userId,
        actorId: shop.organizer.id,
        actorType: shop.organizer.type,
        contentType: 'product',
        contentId: product._id,
        contentTitle: product.name,
        reason: 'new_content',
        imageUrl: product.media[0].url,
        link: `/content/marketplace/${product._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}