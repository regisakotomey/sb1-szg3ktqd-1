'use client';

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import { User } from '@/models/User';
import { Notification } from '@/models/Notification';
import { compressImage, compressImages } from '@/lib/imageCompression';

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const postId = formData.get('postId') as string;
    const userId = formData.get('userId') as string;
    const content = formData.get('content') as string;
    const currentMedia = JSON.parse(formData.get('currentMedia') as string);
    const mediaFiles = formData.getAll('media') as File[];

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

    // Verify post exists and belongs to user
    const post = await Post.findOne({ 
      _id: postId,
      userId,
      isDeleted: { $ne: true }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Publication non trouvée ou non autorisée' },
        { status: 404 }
      );
    }

    // Upload new media files if any
    let newMediaUrls: string[] = [];
    if (mediaFiles.length > 0) {
      const compressedFiles = await compressImages(mediaFiles);
      for (const file of compressedFiles) {
        const mediaUrl = await uploadMedia(file, 'posts');
        newMediaUrls.push(mediaUrl);
      }
    }

    // Combine current and new media
    const media = [...currentMedia, ...newMediaUrls];

    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        content,
        media
      },
      { new: true }
    );

    // Get user info for response
    const author = {
      id: user._id,
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : 'Utilisateur',
      avatar: user.avatar,
      followers: user.followers?.length || 0,
      isFollowed: false // This will be set on client side
    };

    // Create notifications for users who have interacted with the post
    const uniqueUsers = new Set([
      ...post.likes.map(like => like.userId.toString()),
      ...post.comments.map(comment => comment.userId.toString())
    ]);

    // Remove the post author from notification recipients
    uniqueUsers.delete(userId);

    if (uniqueUsers.size > 0) {
      const notifications = Array.from(uniqueUsers).map(interestedUserId => ({
        userId: interestedUserId,
        actorId: userId,
        actorType: 'user',
        contentType: 'post',
        contentId: post._id,
        contentTitle: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        reason: 'content_updated',
        imageUrl: media[0], // First media as preview if available
        link: `/posts/${post._id}`,
        read: false,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json({
      ...updatedPost.toObject(),
      author
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}