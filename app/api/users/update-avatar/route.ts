import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { uploadMedia } from '@/lib/media';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const avatarFile = formData.get('avatar') as File;

    if (!userId || !avatarFile) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    await connectDB();

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Upload de l'image
    const avatarUrl = await uploadMedia(avatarFile, 'avatars');

    // Mise à jour de l'utilisateur
    user.avatar = avatarUrl;
    await user.save();

    return NextResponse.json({
      success: true,
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}