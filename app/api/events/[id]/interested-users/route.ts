import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/models/Event';
import { User } from '@/models/User';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    // Get user details for each interest
    const interestedUsers = await Promise.all(
      event.interests.map(async (interest: any) => {
        const user = await User.findById(interest.userId);
        return {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          interestedAt: interest.interestedAt
        };
      })
    );

    return NextResponse.json({ users: interestedUsers });
  } catch (error) {
    console.error('Error fetching interested users:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}