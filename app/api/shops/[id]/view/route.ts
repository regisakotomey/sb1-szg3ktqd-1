import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Shop } from '@/models/Shop';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json();
    
    await connectDB();

    // Vérifier si l'utilisateur a déjà vu la boutique
    const shop = await Shop.findOne({
      _id: params.id,
      'views.userId': userId
    });

    if (shop) {
      // Si oui, incrémenter le compteur de vues
      await Shop.updateOne(
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
      await Shop.updateOne(
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