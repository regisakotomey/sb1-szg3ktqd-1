import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdSpot } from '@/models/AdSpot';
import { User } from '@/models/User';
import { Place } from '@/models/Place';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('currentUserId');

    await connectDB();

    const adSpot = await AdSpot.findOne({ 
      _id: params.id,
      isDeleted: { $ne: true }
    });
    
    if (!adSpot) {
      return NextResponse.json(
        { error: 'Spot publicitaire non trouvé' },
        { status: 404 }
      );
    }

    // Get creator info based on whether it's a place or user
    let creator;
    if (adSpot.placeId) {
      const place = await Place.findById(adSpot.placeId);
      if (place) {
        creator = {
          id: place._id,
          name: place.name,
          followers: place.followers?.length || 0,
          isFollowed: currentUserId ? place.followers?.some(
            (f: any) => f.userId.toString() === currentUserId
          ) : false,
          type: 'place'
        };
      }
    } else {
      const user = await User.findById(adSpot.userId);
      if (user) {
        creator = {
          id: user._id,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`
            : 'Utilisateur',
          followers: user.followers?.length || 0,
          isFollowed: currentUserId ? user.followers?.some(
            (f: any) => f.userId.toString() === currentUserId
          ) : false,
          type: 'user'
        };
      }
    }

    return NextResponse.json({
      ...adSpot.toObject(),
      creator
    });
  } catch (error) {
    console.error('Error fetching ad spot:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await request.json();

    await connectDB();

    // Check if ad spot exists and belongs to user
    const adSpot = await AdSpot.findOne({ 
      _id: params.id,
      userId,
      isDeleted: { $ne: true }
    });

    if (!adSpot) {
      return NextResponse.json(
        { error: 'Spot publicitaire non trouvé ou non autorisé' },
        { status: 404 }
      );
    }

    // Soft delete
    await AdSpot.findByIdAndUpdate(params.id, {
      isDeleted: true,
      deletedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ad spot:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}