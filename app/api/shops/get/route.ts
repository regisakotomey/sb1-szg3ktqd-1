import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Shop } from '@/models/Shop';
import { User } from '@/models/User';
import { Place } from '@/models/Place';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get('id');
    const placeId = searchParams.get('placeId');
    const currentUserId = searchParams.get('currentUserId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectDB();

    if (shopId) {
      // Get specific shop
      const shop = await Shop.findOne({ 
        _id: shopId,
        isDeleted: { $ne: true }
      });
      
      if (!shop) {
        return NextResponse.json(
          { error: 'Boutique non trouvée' },
          { status: 404 }
        );
      }

      // Get organizer info based on whether it's a place or user
      let organizer;
      if (shop.organizer.type === 'place') {
        const place = await Place.findById(shop.organizer.id);
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
        const user = await User.findById(shop.organizer.id);
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
        ...shop.toObject(),
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

      // Get ALL shops that match the query (no skip/limit yet)
      const shops = await Shop.find(query)
        .sort({ createdAt: -1 })
        .lean();

      // Get organizer info and calculate priority for all shops
      const shopsWithPriority = await Promise.all(
        shops.map(async (shop) => {
          let organizer;
          let priority = 0;

          // Get organizer info
          if (shop.organizer.type === 'place') {
            const place = await Place.findById(shop.organizer.id);
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
            const user = await User.findById(shop.organizer.id);
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

          if (page == 1){
            // Reduce priority based on views
            if (currentUserId) {
              const userViews = shop.views.find(v => v.userId.toString() === currentUserId);
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
            ...shop,
            priority,
            organizer
          };
        })
      );

      // Sort by priority and apply pagination
      const sortedShops = shopsWithPriority.sort((a, b) => b.priority - a.priority);
      const total = sortedShops.length;
      const paginatedShops = sortedShops.slice((page - 1) * limit, page * limit);

      return NextResponse.json({
        shops: paginatedShops,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    }
  } catch (error) {
    console.error('Error fetching shops:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}