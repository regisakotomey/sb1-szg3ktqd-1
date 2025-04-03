import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    const { country_code } = await req.json();

    await connectDB();

    // Create anonymous user
    const user = await User.create({
      country: country_code,
      isAnonymous: true,
      isVerified: false
    });

    return NextResponse.json({ 
      id: user._id,
      country_code: user.country,
      isVerified: user.isVerified,
      isAnonymous: user.isAnonymous
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating anonymous user:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}