import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Shop } from '@/models/Shop';
import { User } from '@/models/User';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const shop = await Shop.findById(params.id);
    if (!shop) {
      return NextResponse.json(
        { error: 'Boutique non trouvée' },
        { status: 404 }
      );
    }

    // Get user details for each follow
    const followingUsers = await Promise.all(
      shop.followers.map(async (follow: any) => {
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