import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Place } from '@/models/Place';
import { Notification } from '@/models/Notification';

export async function DELETE(req: Request) {
  try {
    const { placeId, userId } = await req.json();
    console.log("place id : ", placeId);
    await connectDB();

    // Vérifier si le lieu existe et appartient à l'utilisateur
    const place = await Place.findOne({ 
      _id: placeId,
      'organizer.type': 'user',
      'organizer.id': userId,
      isDeleted: { $ne: true }
    });
    if (!place) {
      return NextResponse.json(
        { error: 'Lieu non trouvé ou non autorisé' },
        { status: 404 }
      );
    }

    // Récupérer la liste des utilisateurs qui suivent ce lieu avant la suppression
    const followers = place.followers.map(follower => follower.userId);

    // Mise à jour soft delete
    await Place.findByIdAndUpdate(placeId, {
      isDeleted: true,
      deletedAt: new Date()
    });

    // Créer une notification pour chaque abonné
    if (followers.length > 0) {
      const notifications = followers.map(followerId => ({
        userId: followerId,
        actorId: userId,
        actorType: 'user',
        contentType: 'place',
        contentId: place._id,
        contentTitle: place.name,
        reason: 'content_deleted',
        imageUrl: place.mainImage,
        link: `/content/places/${place._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression lieu:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}