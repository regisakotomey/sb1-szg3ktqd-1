import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/models/Event';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json();
    
    await connectDB();

    // Vérifier si l'utilisateur a déjà vu l'événement
    const event = await Event.findOne({
      _id: params.id,
      'views.userId': userId
    });

    if (event) {
      // Si oui, incrémenter le compteur de vues
      await Event.updateOne(
        { 
          _id: params.id,
          'views.userId': userId 
        },
        {
          $inc: { 'views.$.viewCount': 1 }
        }
      );
    } else {
      // Si non, ajouter une nouvelle entrée
      await Event.updateOne(
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