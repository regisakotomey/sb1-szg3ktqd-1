import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Opportunity } from '@/models/Opportunity';
import { User } from '@/models/User';
import { Notification } from '@/models/Notification';
import { uploadMedia } from '@/lib/media';

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const opportunityId = formData.get('opportunityId') as string;
    const userId = formData.get('userId') as string;
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const mainImage = formData.get('mainImage') as File | null;
    const currentMainImage = formData.get('currentMainImage') as string;
    const additionalImages = formData.getAll('additionalImages') as File[];
    const currentAdditionalImages = JSON.parse(formData.get('currentAdditionalImages') as string);
    const country = formData.get('country') as string;
    const coordinates = formData.get('coordinates') as string;
    const locationDetails = formData.get('locationDetails') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const website = formData.get('website') as string;

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

    // Get the opportunity to check if it exists and get interested users
    const opportunity = await Opportunity.findOne({ 
      _id: opportunityId,
      'organizer.type': 'user',
      'organizer.id': userId,
      isDeleted: { $ne: true }
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunité non trouvée ou non autorisée' },
        { status: 404 }
      );
    }

    // Get interested users before updating
    const interestedUsers = opportunity.interests.map(interest => interest.userId.toString());

    // Handle media uploads
    let mainImageUrl = currentMainImage;
    if (mainImage) {
      mainImageUrl = await uploadMedia(mainImage, 'opportunities');
    }

    let additionalImageUrls = [...currentAdditionalImages];
    if (additionalImages.length > 0) {
      const newUrls = await Promise.all(
        additionalImages.map(file => uploadMedia(file, 'opportunities'))
      );
      additionalImageUrls = [...additionalImageUrls, ...newUrls];
    }

    // Update opportunity
    const updatedOpportunity = await Opportunity.findByIdAndUpdate(
      opportunityId,
      {
        type,
        title,
        description,
        mainImage: mainImageUrl,
        additionalImages: additionalImageUrls,
        country,
        coordinates,
        locationDetails,
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
        actorId: opportunity.organizer.id,
        actorType: opportunity.organizer.type,
        contentType: 'opportunity',
        contentId: opportunity._id,
        contentTitle: opportunity.title,
        reason: 'content_updated',
        imageUrl: mainImageUrl,
        link: `/content/opportunities/${opportunity._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json(updatedOpportunity);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}