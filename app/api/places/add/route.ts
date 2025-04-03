import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Place } from '@/models/Place';
import { User } from '@/models/User';
import { Notification } from '@/models/Notification';
import { uploadMedia } from '@/lib/media';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const type = formData.get('type') as string;
    const name = formData.get('name') as string;
    const shortDescription = formData.get('shortDescription') as string;
    const longDescription = formData.get('longDescription') as string;
    const services = formData.get('services') as string;
    const logo = formData.get('logo') as File | null;
    const mainImage = formData.get('mainImage') as File;
    const additionalMediaFiles = formData.getAll('additionalImages') as File[];
    const country = formData.get('country') as string;
    const coordinates = formData.get('coordinates') as string;
    const locationDetails = formData.get('locationDetails') as string;
    const openingHours = JSON.parse(formData.get('openingHours') as string);
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
    let logoUrl = null;
    if (logo) {
      logoUrl = await uploadMedia(logo, 'places');
    }

    const mainImageUrl = await uploadMedia(mainImage, 'places');
    const additionalImageUrls = await Promise.all(
      additionalMediaFiles.map(file => uploadMedia(file, 'places'))
    );

    // Créer le lieu avec le nouvel attribut organizer
    const place = await Place.create({
      organizer: {
        type: 'user',
        id: userId
      },
      type,
      name,
      shortDescription,
      longDescription,
      services,
      logo: logoUrl,
      mainImage: mainImageUrl,
      additionalImages: additionalImageUrls,
      country,
      coordinates,
      locationDetails,
      openingHours,
      contact: {
        phone,
        email,
        website
      }
    });

    // Créer une notification pour chaque abonné
    const followers = await User.find(
      { 'following.userId': userId, _id: { $ne: userId } }, // Exclut userId lui-même
      { _id: 1 } // Ne récupérer que l'ID des abonnés
    ).lean();

    const notifications = followers.map(follower => ({
      userId: follower._id,
      actorId: userId,
      actorType: 'user',
      contentType: 'place',
      contentId: place._id,
      contentTitle: place.name,
      reason: 'new_content',
      imageUrl: mainImageUrl,
      link: `/content/places/${place._id}`,
      read: false,
      createdAt: new Date()
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return NextResponse.json(place, { status: 201 });
  } catch (error) {
    console.error('Erreur création lieu:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}