import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Place } from '@/models/Place';
import { User } from '@/models/User';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('currentUserId');

    await connectDB();

    const place = await Place.findOne({ 
      _id: params.id,
      isDeleted: { $ne: true }
    });
    
    if (!place) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }

    // Get owner info
    const owner = await User.findById(place.organizer.id);
    if (!owner) {
      return NextResponse.json(
        { error: 'Propriétaire non trouvé' },
        { status: 404 }
      );
    }

    // Check if current user follows the owner
    const isFollowed = currentUserId ? 
      owner.followers?.some((follow: any) => 
        follow.userId.toString() === currentUserId
      ) : false;

    // Return place with owner info
    return NextResponse.json({
      ...place.toObject(),
      owner: {
        id: owner._id,
        name: owner.firstName && owner.lastName 
          ? `${owner.firstName} ${owner.lastName}`
          : 'Utilisateur',
        followers: owner.followers?.length || 0,
        isFollowed
      }
    });
  } catch (error) {
    console.error('Error fetching place:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, ...placeData } = body;

    await connectDB();

    // Check if place exists and belongs to user
    const place = await Place.findOne({ 
      _id: params.id,
      'organizer.type': 'user',
      'organizer.id': userId,
      isDeleted: { $ne: true }
    });

    if (!place) {
      return NextResponse.json(
        { error: 'Lieu non trouvé ou non autorisé' },
        { status: 404 }
      );
    }

    // Update place
    const updatedPlace = await Place.findByIdAndUpdate(
      params.id,
      { ...placeData },
      { new: true }
    );

    return NextResponse.json(updatedPlace);
  } catch (error) {
    console.error('Error updating place:', error);
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

    // Check if place exists and belongs to user
    const place = await Place.findOne({ 
      _id: params.id,
      'organizer.type': 'user',
      'organizer.id': userId,
      isDeleted: { $ne: true }
    });

    if (!place) {
      return NextResponse.json(
        { error: 'Lieu non trouvé ou non autorisé' },
        { status: 404 }
      );
    }

    // Soft delete
    await Place.findByIdAndUpdate(params.id, {
      isDeleted: true,
      deletedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting place:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}