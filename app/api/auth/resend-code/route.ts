import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { generateVerificationCode } from '@/lib/verification';
import { sendVerificationCode } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Générer un nouveau code
    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    await user.save();

    // Envoyer le code
    const destination = user.email || user.phone;
    if (destination) {
      await sendVerificationCode(destination, verificationCode);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur renvoi code:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}