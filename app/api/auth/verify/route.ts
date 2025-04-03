import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { code, userId } = await req.json();

    // Validation des champs
    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Code et ID utilisateur requis' },
        { status: 400 }
      );
    }

    // Recherche de l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérification du code
    if (!user.verificationCode) {
      return NextResponse.json(
        { error: 'Aucun code de vérification trouvé' },
        { status: 400 }
      );
    }

    if (user.verificationCode !== code) {
      return NextResponse.json(
        { error: 'Code invalide' },
        { status: 400 }
      );
    }

    // Activer l'utilisateur
    user.isVerified = true;
    user.isAnonymous = false;
    user.verificationCode = undefined;
    await user.save();

    return NextResponse.json({ 
      success: true,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        country_code: user.country,
        sector: user.sector,
        isVerified: user.isVerified,
        isAnonymous: user.isAnonymous
      }
    });
  } catch (error) {
    console.error('Erreur vérification:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}