import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import { Event } from '@/models/Event';
import { Place } from '@/models/Place';
import { Shop } from '@/models/Shop';
import { Opportunity } from '@/models/Opportunity';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    await connectDB();

    console.log("type : ", type);

    let query = { isDeleted: { $ne: true } };
    let items = [];
    let total = 0;

    switch (type) {
      case 'posts':
        query = { ...query, userId: params.id };
        total = await Post.countDocuments(query);
        items = await Post.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .then(posts => posts.map(post => ({
            id: post._id,
            title: post.content,
            description: null,
            image: post.media[0],
            createdAt: post.createdAt,
            likes: post.likes.length,
            comments: post.comments.length
          })));
        break;

      case 'events':
        query = { ...query, 'organizer.type': 'user', 'organizer.id': params.id };
        total = await Event.countDocuments(query);
        items = await Event.find(query)
          .sort({ startDate: 1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .then(events => events.map(event => ({
            id: event._id,
            title: event.title,
            description: event.description,
            image: event.mainMedia,
            type: event.type,
            date: event.startDate,
            location: event.address,
            interests: event.interests?.length || 0
          })));
        break;

      case 'places':
        query = { ...query, 'organizer.type': 'user', 'organizer.id': params.id };
        total = await Place.countDocuments(query);
        items = await Place.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .then(places => places.map(place => ({
            id: place._id,
            title: place.name,
            description: place.shortDescription,
            image: place.mainImage,
            type: place.type,
            location: place.locationDetails,
            followers: place.followers?.length || 0
          })));
        break;

      case 'opportunities':
        query = { ...query, 'organizer.type': 'user', 'organizer.id': params.id };
        total = await Opportunity.countDocuments(query);
        items = await Opportunity.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .then(opportunities => opportunities.map(opportunity => ({
            id: opportunity._id,
            title: opportunity.title,
            description: opportunity.description,
            image: opportunity.mainImage,
            type: opportunity.type,
            location: opportunity.locationDetails,
            interests: opportunity.interests?.length || 0
          })));
        break;

      case 'shops':
        query = { ...query, 'organizer.type': 'user', 'organizer.id': params.id };
        total = await Shop.countDocuments(query);
        items = await Shop.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .then(shops => shops.map(shop => ({
            id: shop._id,
            title: shop.name,
            description: shop.description,
            image: shop.logo,
            type: shop.type,
            location: shop.countries.join(', '),
            followers: shop.followers?.length || 0
          })));
        break;

      default:
        return NextResponse.json(
          { error: 'Type de contenu invalide' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      items,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: skip + items.length < total
      }
    });

  } catch (error) {
    console.error('Error fetching user content:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
