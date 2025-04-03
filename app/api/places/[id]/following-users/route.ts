import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Place } from '@/models/Place';
import { User } from '@/models/User';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const place = await Place.findById(params.id);
    if (!place) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }

    // Get user details for each follow
    const followingUsers = await Promise.all(
      place.followers.map(async (follow: any) => {
        const user = await User.findById(follow.userId);
        return {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          followedAt: follow.followedAt
        };
      })
    );

    return NextResponse.json({ users: followingUsers });
  } catch (error) {
    console.error('Error fetching following users:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}