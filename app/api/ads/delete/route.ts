import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdSpot } from '@/models/AdSpot';

export async function DELETE(req: Request) {
  try {
    const { adSpotId, userId } = await req.json();

    await connectDB();

    // Verify ad spot exists and belongs to user
    const adSpot = await AdSpot.findOne({ 
      _id: adSpotId,
      userId,
      isDeleted: { $ne: true }
    });

    if (!adSpot) {
      return NextResponse.json(
        { error: 'Spot publicitaire non trouvé ou non autorisé' },
        { status: 404 }
      );
    }

    // Soft delete
    await AdSpot.findByIdAndUpdate(adSpotId, {
      isDeleted: true,
      deletedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ad spot:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}