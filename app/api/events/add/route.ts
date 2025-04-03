import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/models/Event';
import { User } from '@/models/User';
import { Place } from '@/models/Place';
import { Notification } from '@/models/Notification';
import { uploadMedia } from '@/lib/media';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const placeId = formData.get('placeId') as string;
    const title = formData.get('title') as string;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const mainMedia = formData.get('mainMedia') as File;
    const additionalMediaFiles = formData.getAll('additionalMedia') as File[];
    const country = formData.get('country') as string;
    const coordinates = formData.get('coordinates') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const website = formData.get('website') as string;

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

    // Upload des médias
    const mainMediaUrl = await uploadMedia(mainMedia, 'events');
    const additionalMediaUrls = await Promise.all(
      additionalMediaFiles.map(file => uploadMedia(file, 'events'))
    );

    // Créer l'événement avec le nouvel attribut organizer
    const event = await Event.create({
      organizer: {
        type: placeId ? 'place' : 'user',
        id: placeId || userId
      },
      title,
      type,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      mainMedia: mainMediaUrl,
      additionalMedia: additionalMediaUrls,
      country,
      coordinates,
      address,
      contact: {
        phone,
        email,
        website
      }
    });

    // Récupérer les abonnés en fonction du type d'organisateur
    let followers;
    if (placeId) {
      // Si l'événement est créé par un lieu, notifier les abonnés du lieu
      const place = await Place.findById(placeId);
      if (place) {
        followers = place.followers.map(follower => ({
          _id: follower.userId
        }));
      }
    } else {
      // Si l'événement est créé par un utilisateur, notifier ses abonnés
      followers = await User.find(
        { 'following.userId': userId, _id: { $ne: userId } },
        { _id: 1 }
      ).lean();
    }

    // Créer les notifications
    if (followers && followers.length > 0) {
      const notifications = followers.map(follower => ({
        userId: follower._id,
        actorId: placeId || userId,
        actorType: placeId ? 'place' : 'user',
        contentType: 'event',
        contentId: event._id,
        contentTitle: event.title,
        reason: 'new_content',
        imageUrl: mainMediaUrl,
        link: `/content/events/${event._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Erreur création événement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}