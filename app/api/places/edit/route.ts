import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Place } from '@/models/Place';
import { User } from '@/models/User';
import { Notification } from '@/models/Notification';
import { uploadMedia } from '@/lib/media';

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const placeId = formData.get('placeId') as string;
    const userId = formData.get('userId') as string;
    const type = formData.get('type') as string;
    const name = formData.get('name') as string;
    const shortDescription = formData.get('shortDescription') as string;
    const longDescription = formData.get('longDescription') as string;
    const services = formData.get('services') as string;
    const logo = formData.get('logo') as File | null;
    const mainImage = formData.get('mainImage') as File | null;
    const additionalImages = formData.getAll('additionalImages') as File[];
    const country = formData.get('country') as string;
    const coordinates = formData.get('coordinates') as string;
    const locationDetails = formData.get('locationDetails') as string;
    const openingHours = JSON.parse(formData.get('openingHours') as string);
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const website = formData.get('website') as string;
    const currentLogo = formData.get('currentLogo') as string;
    const currentMainImage = formData.get('currentMainImage') as string;
    const currentAdditionalImages = JSON.parse(formData.get('currentAdditionalImages') as string);

    await connectDB();

    // Verify user exists and is verified
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

    // Verify if place exists and belongs to user
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

    // Get followers before updating
    const followers = place.followers.map(follower => follower.userId.toString());

    // Gérer le logo
    let logoUrl = currentLogo;
    if (logo) {
      logoUrl = await uploadMedia(logo, 'places');
    }

    let mainImageUrl = currentMainImage;
    if (mainImage) {
      mainImageUrl = await uploadMedia(mainImage, 'places');
    }

    let additionalImageUrls = [...currentAdditionalImages];
    if (additionalImages.length > 0) {
      const newUrls = await Promise.all(
        additionalImages.map(file => uploadMedia(file, 'places'))
      );
      additionalImageUrls = [...additionalImageUrls, ...newUrls];
    }

    // Update place
    const updatedPlace = await Place.findByIdAndUpdate(
      placeId,
      {
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
      },
      { new: true }
    );

    // Create notifications for followers
    if (followers.length > 0) {
      const notifications = followers.map(followerId => ({
        userId: followerId,
        actorId: userId,
        actorType: 'user',
        contentType: 'place',
        contentId: place._id,
        contentTitle: place.name,
        reason: 'content_updated',
        imageUrl: mainImageUrl,
        link: `/content/places/${place._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json(updatedPlace);
  } catch (error) {
    console.error('Error updating place:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}