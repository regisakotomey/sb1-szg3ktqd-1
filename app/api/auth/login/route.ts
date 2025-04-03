import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { login, password, anonymousId } = await req.json();

    // Validation des champs
    if (!login || !password) {
      return NextResponse.json(
        { error: 'Identifiants requis' },
        { status: 400 }
      );
    }

    // Recherche de l'utilisateur
    const user = await User.findOne({
      $or: [{ email: login }, { phone: login }],
      isAnonymous: false
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 404 }
      );
    }

    // Vérification du mot de passe
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Supprimer l'utilisateur anonyme s'il existe
    if (anonymousId) {
      await User.findOneAndDelete({ 
        _id: anonymousId,
        isAnonymous: true 
      });
    }

    // Création de la réponse
    const response = NextResponse.json({ 
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

    return response;
  } catch (error) {
    console.error('Erreur connexion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}