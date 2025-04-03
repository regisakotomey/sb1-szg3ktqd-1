import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { generateVerificationCode } from '@/lib/verification';
import { sendVerificationCode } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const { contact } = await req.json();

    if (!contact) {
      return NextResponse.json(
        { error: 'Email ou téléphone requis' },
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
        { error: 'Aucun compte associé' },
        { status: 404 }
      );
    }

    // Générer le code de vérification
    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    await user.save();

    // Envoyer le code
    await sendVerificationCode(contact, verificationCode);

    return NextResponse.json({ 
      message: 'Code envoyé avec succès'
    });
  } catch (error) {
    console.error('Erreur récupération mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}