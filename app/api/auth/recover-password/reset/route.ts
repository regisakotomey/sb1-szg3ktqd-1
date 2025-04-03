import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { contact, newPassword } = await req.json();

    if (!contact || !newPassword) {
      return NextResponse.json(
        { error: 'Contact et nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    await connectDB();

    // Recherche de l'utilisateur
    const user = await User.findOne({
      $or: [{ email: contact }, { phone: contact }]
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour le mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.verificationCode = undefined;
    await user.save();

    return NextResponse.json({ 
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur réinitialisation mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}