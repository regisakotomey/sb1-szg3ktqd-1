// app/api/places/get/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Place } from '@/models/Place';
import { User } from '@/models/User';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get('id');
    const currentUserId = searchParams.get('currentUserId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectDB();

    if (placeId) {
      // Get specific place
      const place = await Place.findOne({ 
        _id: placeId,
        isDeleted: { $ne: true }
      });
      
      if (!place) {
        return NextResponse.json(
          { error: 'Lieu non trouvé' },
          { status: 404 }
        );
      }

      // Get organizer info based on whether it's a place or user
      let organizer;
      if (place.organizer.type === 'place') {
        const organizerPlace = await Place.findById(place.organizer.id);
        if (organizerPlace) {
          organizer = {
            id: organizerPlace._id,
            name: organizerPlace.name,
            followers: organizerPlace.followers?.length || 0,
            isFollowed: currentUserId ? organizerPlace.followers?.some(
              (f: any) => f.userId.toString() === currentUserId
            ) : false,
            type: 'place'
          };
        }
      } else {
        const user = await User.findById(place.organizer.id);
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
        ...place.toObject(),
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

      // Get ALL places that aren't deleted (no skip/limit yet)
      const places = await Place.find({ isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .lean();

      // Get organizer info and calculate priority for all places
      const placesWithPriority = await Promise.all(
        places.map(async (place) => {
          let organizer;
          let priority = 0;

          // Get organizer info
          if (place.organizer.type === 'place') {
            const organizerPlace = await Place.findById(place.organizer.id);
            if (organizerPlace) {
              organizer = {
                id: organizerPlace._id,
                name: organizerPlace.name,
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
                
                // Calculer la priorité basée sur le suivi
                isPlaceFollower = placeFollowerIds.includes(currentUser._id.toString());
                isPlaceOrganizerFollowing = placeOrganizerFollowingIds.includes(currentUser._id.toString());
                isPlaceOrganizerFollower = placeOrganizerFollowerIds.includes(currentUser._id.toString());
                
                if (isPlaceFollower && isPlaceOrganizerFollowing && isPlaceOrganizerFollower) priority = 100;
                else if (isPlaceOrganizerFollowing && isPlaceOrganizerFollower) priority = 85;
                else if (isPlaceOrganizerFollowing) priority = 70;
                else if (isPlaceOrganizerFollower) priority = 55;
                else priority = 40;
              }
            }
          } else {
            const user = await User.findById(place.organizer.id);
            if (user) {
              organizer = {
                id: user._id,
                name: user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : 'Utilisateur',
                type: 'user'
              };
              
              // Calculer la priorité basée sur le suivi
              isUserFollowing = userFollowingIds.includes(user._id.toString());
              isUserFollower = userFollowerIds.includes(user._id.toString());
              
              if (isUserFollowing && isUserFollower) priority = 100;
              else if (isUserFollowing) priority = 85;
              else if (isUserFollower) priority = 70;
              else priority = 40;
            }
          }

          if (page == 1){
            // Réduire la priorité basée sur les vues
            if (currentUserId) {
              const userViews = place.views.find(v => v.userId.toString() === currentUserId);
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
            ...place,
            priority,
            organizer
          };
        })
      );

      // Sort by priority and apply pagination
      const sortedPlaces = placesWithPriority.sort((a, b) => b.priority - a.priority);
      const total = sortedPlaces.length;
      const paginatedPlaces = sortedPlaces.slice((page - 1) * limit, page * limit);

      return NextResponse.json({
        places: paginatedPlaces,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    }
  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
