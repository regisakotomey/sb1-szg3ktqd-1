'use client';

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/models/Event';
import { User } from '@/models/User';
import { Notification } from '@/models/Notification';
import { compressImage, compressImages } from '@/lib/imageCompression';
import { uploadMedia } from '@/lib/media';

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const eventId = formData.get('eventId') as string;
    const userId = formData.get('userId') as string;
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const mainMedia = formData.get('mainMedia') as File | null;
    const currentMainMedia = formData.get('currentMainMedia') as string;
    const additionalMedia = formData.getAll('additionalMedia') as File[];
    const currentAdditionalMedia = JSON.parse(formData.get('currentAdditionalMedia') as string);
    const country = formData.get('country') as string;
    const coordinates = formData.get('coordinates') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const website = formData.get('website') as string;
    const placeId = formData.get('placeId') as string;

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

    // Verify if event exists and belongs to user
    const event = await Event.findOne({ 
      _id: eventId,
      'organizer.type': placeId ? 'place' : 'user',
      'organizer.id': placeId || userId,
      isDeleted: { $ne: true }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé ou non autorisé' },
        { status: 404 }
      );
    }

    // Get interested users before updating
    const interestedUsers = event.interests.map(interest => interest.userId.toString());

    // Compress and upload new media if provided
    let mainMediaUrl = currentMainMedia;
    if (mainMedia) {
      const compressedMainMedia = await compressImage(mainMedia);
      mainMediaUrl = await uploadMedia(compressedMainMedia, 'events');
    }

    let additionalMediaUrls = [...currentAdditionalMedia];
    if (additionalMedia.length > 0) {
      const compressedAdditionalMedia = await compressImages(additionalMedia);
      const newUrls = await Promise.all(
        compressedAdditionalMedia.map(file => uploadMedia(file, 'events'))
      );
      additionalMediaUrls = [...additionalMediaUrls, ...newUrls];
    }

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        type,
        title,
        description,
        startDate,
        endDate,
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
      },
      { new: true }
    );

    // Create notifications for interested users
    if (interestedUsers.length > 0) {
      const notifications = interestedUsers.map(userId => ({
        userId,
        actorId: event.organizer.id,
        actorType: event.organizer.type,
        contentType: 'event',
        contentId: event._id,
        contentTitle: event.title,
        reason: 'content_updated',
        imageUrl: mainMediaUrl,
        link: `/content/events/${event._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}