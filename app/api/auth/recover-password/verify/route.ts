import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    const { contact, code } = await req.json();

    if (!contact || !code) {
      return NextResponse.json(
        { error: 'Contact et code requis' },
        { status: 400 }
      );
    }

    await connectDB();

    // Recherche de l'utilisateur
    const user = await User.findOne({
      $or: [{ email: contact }, { phone: contact }],
      verificationCode: code
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Code invalide' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true,
      userId: user._id
    });
  } catch (error) {
    console.error('Erreur vérification code:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}