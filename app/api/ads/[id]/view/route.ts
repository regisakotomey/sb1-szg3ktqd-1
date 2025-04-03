import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdSpot } from '@/models/AdSpot';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json();
    
    await connectDB();

    // Check if user has already viewed this ad spot
    const adSpot = await AdSpot.findOne({
      _id: params.id,
      'views.userId': userId
    });

    if (adSpot) {
      // If yes, increment view count
      await AdSpot.updateOne(
        { 
          _id: params.id,
          'views.userId': userId 
        },
        {
          $inc: { 'views.$.viewCount': 1 }
        }
      );
    } else {
      // If no, add new view entry
      await AdSpot.updateOne(
        { _id: params.id },
        {
          $push: { 
            views: {
              userId,
              viewedAt: new Date(),
              viewCount: 1
            }
          }
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording view:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}