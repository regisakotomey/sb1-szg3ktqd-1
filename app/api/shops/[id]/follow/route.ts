import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Shop } from '@/models/Shop';
import { User } from '@/models/User';
import { Notification } from '@/models/Notification';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json();
    
    await connectDB();

    // Verify user exists and is verified
    const user = await User.findById(userId);
    if (!user || !user.isVerified) {
      return NextResponse.json(
        { error: 'Utilisateur non autorisé' },
        { status: 403 }
      );
    }

    // Add follow
    const shop = await Shop.findByIdAndUpdate(
      params.id,
      {
        $addToSet: { 
          followers: {
            userId,
            followedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!shop) {
      return NextResponse.json(
        { error: 'Boutique non trouvée' },
        { status: 404 }
      );
    }

    // Create notification for shop owner
    await Notification.create({
      userId: shop.organizer.id, // The shop owner will receive the notification
      actorId: userId, // The user who followed
      actorType: 'user',
      contentType: 'shop',
      contentId: shop._id,
      contentTitle: shop.name,
      reason: 'content_followed',
      imageUrl: shop.logo,
      link: `/content/shops/${shop._id}`,
      read: false,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding follow:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json();
    
    await connectDB();

    // Remove follow
    const shop = await Shop.findByIdAndUpdate(
      params.id,
      {
        $pull: { 
          followers: { userId }
        }
      },
      { new: true }
    );

    if (!shop) {
      return NextResponse.json(
        { error: 'Boutique non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing follow:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}