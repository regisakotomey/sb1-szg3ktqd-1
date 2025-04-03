import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Report } from '@/models/Report';
import { User } from '@/models/User';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, reason, description } = await req.json();
    
    await connectDB();

    // Verify user exists and is verified
    const user = await User.findById(userId);
    if (!user || !user.isVerified) {
      return NextResponse.json(
        { error: 'Utilisateur non autorisé' },
        { status: 403 }
      );
    }

    // Check if user has already reported this user
    const existingReport = await Report.findOne({
      userId,
      contentId: params.id,
      contentType: 'user'
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'Vous avez déjà signalé cet utilisateur' },
        { status: 400 }
      );
    }

    // Verify reported user exists
    const reportedUser = await User.findById(params.id);
    if (!reportedUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Create report
    const report = await Report.create({
      userId,
      contentId: params.id,
      contentType: 'user',
      reason,
      description,
      status: 'pending'
    });

    return NextResponse.json({ 
      success: true,
      reportId: report._id
    });
  } catch (error) {
    console.error('Error reporting user:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}