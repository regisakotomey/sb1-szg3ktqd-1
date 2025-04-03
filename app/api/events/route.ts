import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/models/Event';
import { User } from '@/models/User';
import { isValidEvent } from '@/lib/validation/event';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, ...eventData } = body;

    // Validation des données
    const validationError = isValidEvent(eventData);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

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

    // Créer l'événement
    const event = await Event.create({
      ...eventData,
      userId
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Erreur création événement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}