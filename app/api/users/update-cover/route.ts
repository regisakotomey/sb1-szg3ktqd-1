import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { uploadMedia } from '@/lib/media';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const coverFile = formData.get('cover') as File;

    if (!userId || !coverFile) {
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
    const coverUrl = await uploadMedia(coverFile, 'covers');

    // Mise à jour de l'utilisateur
    user.coverImage = coverUrl;
    await user.save();

    return NextResponse.json({
      success: true,
      coverImage: coverUrl
    });
  } catch (error) {
    console.error('Error updating cover:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}