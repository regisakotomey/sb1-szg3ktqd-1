import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import { User } from '@/models/User';
import { Notification } from '@/models/Notification';
import { uploadMedia } from '@/lib/media';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const content = formData.get('content') as string;
    const mediaFiles = formData.getAll('media') as File[];

    await connectDB();

    // Vérifier si l'utilisateur existe et est vérifié
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Compte non vérifié' },
        { status: 403 }
      );
    }

    // Upload media files
    const mediaUrls = await Promise.all(
      mediaFiles.map(file => uploadMedia(file, 'posts'))
    );

    // Create post
    const post = await Post.create({
      userId,
      content,
      media: mediaUrls
    });

    // Créer une notification pour chaque abonné
    const followers = await User.find({
      'following.userId': userId
    });

    const notifications = followers.map(follower => ({
      userId: follower._id,
      actorId: userId,
      contentType: 'post',
      contentId: post._id,
      contentTitle: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      reason: 'new_content',
      imageUrl: mediaUrls[0], // Utiliser la première image comme aperçu si disponible
      link: `/posts/${post._id}`
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}