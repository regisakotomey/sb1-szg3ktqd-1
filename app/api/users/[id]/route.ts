import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Event } from '@/models/Event';
import { Place } from '@/models/Place';
import { Shop } from '@/models/Shop';
import { Product } from '@/models/Product';
import { Opportunity } from '@/models/Opportunity';
import { Post } from '@/models/Post';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('currentUserId');
    const contentType = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    await connectDB();

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Check if current user follows this user
    const isFollowed = currentUserId ? 
      user.followers?.some((follow: any) => follow.userId.toString() === currentUserId)
      : false;

    // Return user data with content and interactions
    return NextResponse.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      country_code: user.country,
      avatar: user.avatar,
      coverImage: user.coverImage,
      sector: user.sector,
      followers: user.followers?.length || 0,
      following: user.following?.length || 0,
      isFollowed
    });
  } catch (error) {
    console.error('Error fetching user:', error);
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
    const { firstName, lastName, sector, country } = body;

    await connectDB();

    // Find and update user
    const user = await User.findByIdAndUpdate(
      params.id,
      {
        firstName,
        lastName,
        sector,
        country
      },
      { new: true } // Return updated document
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Return updated user data
    return NextResponse.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      country_code: user.country,
      avatar: user.avatar,
      coverImage: user.coverImage,
      sector: user.sector,
      followers: user.followers?.length || 0,
      following: user.following?.length || 0,
      isFollowed: false // Reset since this is the owner updating
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}