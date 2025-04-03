import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/models/Event';
import { User } from '@/models/User';
import { Place } from '@/models/Place';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('id');
    const placeId = searchParams.get('placeId');
    const currentUserId = searchParams.get('currentUserId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectDB();

    if (eventId) {
      // Get specific event
      const event = await Event.findOne({ 
        _id: eventId,
        isDeleted: { $ne: true }
      });
      
      if (!event) {
        return NextResponse.json(
          { error: 'Événement non trouvé' },
          { status: 404 }
        );
      }

      // Get organizer info based on whether it's a place or user
      let organizer;
      if (event.organizer.type === 'place') {
        const place = await Place.findById(event.organizer.id);
        if (place) {
          organizer = {
            id: place._id,
            name: place.name,
            followers: place.followers?.length || 0,
            isFollowed: currentUserId ? place.followers?.some(
              (f: any) => f.userId.toString() === currentUserId
            ) : false,
            type: 'place'
          };
        }
      } else {
        const user = await User.findById(event.organizer.id);
        if (user) {
          organizer = {
            id: user._id,
            name: user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}`
              : 'Utilisateur',
            followers: user.followers?.length || 0,
            isFollowed: currentUserId ? user.followers?.some(
              (f: any) => f.userId.toString() === currentUserId
            ) : false,
            type: 'user'
          };
        }
      }

      return NextResponse.json({
        ...event.toObject(),
        organizer
      });
    } else {
      let isUserFollowing: any;
      let isUserFollower: any;
      let isPlaceFollower: any;
      let isPlaceOrganizerFollowing: any;
      let isPlaceOrganizerFollower: any;
      // Get current user's following and followers lists
      const currentUser = currentUserId ? await User.findById(currentUserId) : null;
      const userFollowingIds = currentUser?.following?.map(f => f.userId.toString()) || [];
      const userFollowerIds = currentUser?.followers?.map(f => f.userId.toString()) || [];

      // Build query based on placeId
      const query: any = { isDeleted: { $ne: true } };
      if (placeId) {
        query['organizer.type'] = 'place';
        query['organizer.id'] = placeId;
      }

      // Get ALL events that match the query (no skip/limit yet)
      const events = await Event.find(query)
        .sort({ startDate: 1 })
        .lean();

      // Get organizer info and calculate priority for all events
      const eventsWithPriority = await Promise.all(
        events.map(async (event) => {
          let organizer;
          let priority = 0;

          // Get organizer info
          if (event.organizer.type === 'place') {
            const place = await Place.findById(event.organizer.id);
            if (place) {
              organizer = {
                id: place._id,
                name: place.name,
                type: 'place'
              };
              
              // Get place followers list
              const placeFollowerIds = place?.followers?.map(f => f.userId.toString()) || [];

              const placeOrganizer = await User.findById(place.organizer.id);
              if (placeOrganizer) {
                organizer = {
                  id: placeOrganizer._id,
                  name: placeOrganizer.firstName && placeOrganizer.lastName 
                    ? `${placeOrganizer.firstName} ${placeOrganizer.lastName}`
                    : 'Utilisateur',
                  type: 'user'
                };

                // Get placeOrganizer following and followers lists
                const placeOrganizerFollowingIds = placeOrganizer?.following?.map(f => f.userId.toString()) || [];
                const placeOrganizerFollowerIds = placeOrganizer?.followers?.map(f => f.userId.toString()) || [];
                
                // Calculate priority based on following status
                isPlaceFollower = placeFollowerIds.includes(currentUser?._id.toString());
                isPlaceOrganizerFollowing = placeOrganizerFollowingIds.includes(currentUser?._id.toString());
                isPlaceOrganizerFollower = placeOrganizerFollowerIds.includes(currentUser?._id.toString());
                
                if (isPlaceFollower && isPlaceOrganizerFollowing && isPlaceOrganizerFollower) priority = 100;
                else if (isPlaceOrganizerFollowing && isPlaceOrganizerFollower) priority = 85;
                else if (isPlaceOrganizerFollowing) priority = 70;
                else if (isPlaceOrganizerFollower) priority = 55;
                else priority = 40;
              }
            }
          } else {
            const user = await User.findById(event.organizer.id);
            if (user) {
              organizer = {
                id: user._id,
                name: user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : 'Utilisateur',
                type: 'user'
              };
              
              // Calculate priority based on following status
              isUserFollowing = userFollowingIds.includes(user._id.toString());
              isUserFollower = userFollowerIds.includes(user._id.toString());
              
              if (isUserFollowing && isUserFollower) priority = 100;
              else if (isUserFollowing) priority = 85;
              else if (isUserFollower) priority = 70;
              else priority = 40;
            }
          }

          // Add recency factor (0-100 points)
          const ageInHours = (Date.now() - new Date(event.startDate).getTime()) / (1000 * 60 * 60);
          const recencyScore = Math.max(0, 100 - ageInHours);
          priority += recencyScore;

          if (page == 1){
            // Reduce priority based on views
            if (currentUserId) {
              const userViews = event.views.find(v => v.userId.toString() === currentUserId);
              if (userViews) {
                if (isPlaceFollower && isPlaceOrganizerFollowing && isPlaceOrganizerFollower) {
                  priority = Math.max(0, priority - (userViews.viewCount * 25));
                }else if (isUserFollowing && isUserFollower) {
                  priority = Math.max(0, priority - (userViews.viewCount * 25));
                } else if (isPlaceOrganizerFollowing && isPlaceOrganizerFollower) {
                  priority = Math.max(0, priority - (userViews.viewCount * 21.25));
                } else if (isUserFollowing) {
                  priority = Math.max(0, priority - (userViews.viewCount * 21.25));
                } else if (isPlaceOrganizerFollowing) {
                  priority = Math.max(0, priority - (userViews.viewCount * 17.5));
                } else if (isUserFollower) {
                  priority = Math.max(0, priority - (userViews.viewCount * 17.5));
                } else if (isPlaceOrganizerFollower) {
                  priority = Math.max(0, priority - (userViews.viewCount * 13.75));
                } else {
                  priority = Math.max(0, priority - (userViews.viewCount * 10));
                }
              }
            }
          }

          return {
            ...event,
            priority,
            organizer
          };
        })
      );

      // Sort by priority and apply pagination
      const sortedEvents = eventsWithPriority.sort((a, b) => b.priority - a.priority);
      const total = sortedEvents.length;
      const paginatedEvents = sortedEvents.slice((page - 1) * limit, page * limit);

      return NextResponse.json({
        events: paginatedEvents,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}