import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('currentUserId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    await connectDB();

    // Get user and their followers
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Get total count of followers
    const total = user.followers?.length || 0;

    // Get paginated followers with user details
    const followers = await Promise.all(
      user.followers
        .slice(skip, skip + limit)
        .map(async (follow: any) => {
          const follower = await User.findById(follow.userId);
          if (!follower) return null;

          // Check if current user follows this follower
          const isFollowing = currentUserId ? 
            follower.followers?.some(
              (f: any) => f.userId.toString() === currentUserId
            ) : false;

          return {
            id: follower._id,
            name: follower.firstName && follower.lastName 
              ? `${follower.firstName} ${follower.lastName}`
              : 'Utilisateur',
            avatar: null, // TODO: Implement avatar support
            bio: '', // TODO: Implement bio support
            isFollowing,
            followedAt: follow.followedAt
          };
        })
    );

    // Filter out null values (in case some users were deleted)
    const validFollowers = followers.filter(f => f !== null);

    return NextResponse.json({
      followers: validFollowers,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: skip + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}