import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Opportunity } from '@/models/Opportunity';
import { Notification } from '@/models/Notification';

export async function DELETE(req: Request) {
  try {
    const { opportunityId, userId } = await req.json();

    await connectDB();

    // Verify opportunity exists and belongs to user
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

    // Get list of interested users before deletion
    const interestedUsers = opportunity.interests.map(interest => interest.userId);

    // Soft delete
    await Opportunity.findByIdAndUpdate(opportunityId, {
      isDeleted: true,
      deletedAt: new Date()
    });

    // Create notification for each interested user
    if (interestedUsers.length > 0) {
      const notifications = interestedUsers.map(userId => ({
        userId,
        actorId: opportunity.organizer.id,
        actorType: opportunity.organizer.type,
        contentType: 'opportunity',
        contentId: opportunity._id,
        contentTitle: opportunity.title,
        reason: 'content_deleted',
        imageUrl: opportunity.mainImage,
        link: `/content/opportunities/${opportunity._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}