import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdSpot } from '@/models/AdSpot';
import { User } from '@/models/User';
import { Place } from '@/models/Place';
import { Shop } from '@/models/Shop';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adSpotId = searchParams.get('id');
    const placeId = searchParams.get('placeId');
    const shopId = searchParams.get('shopId');
    const currentUserId = searchParams.get('currentUserId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectDB();

    if (adSpotId) {
      // Get specific ad spot
      const adSpot = await AdSpot.findOne({ 
        _id: adSpotId,
        isDeleted: { $ne: true }
      });
      
      if (!adSpot) {
        return NextResponse.json(
          { error: 'Spot publicitaire non trouvé' },
          { status: 404 }
        );
      }

      // Get creator info based on whether it's a place or shop
      let creator;
      if (adSpot.placeId) {
        const place = await Place.findById(adSpot.placeId);
        if (place) {
          creator = {
            id: place._id,
            name: place.name,
            followers: place.followers?.length || 0,
            isFollowed: currentUserId ? place.followers?.some(
              (f: any) => f.userId.toString() === currentUserId
            ) : false,
            type: place.type
          };
        }
      } else if (adSpot.shopId) {
        const shop = await Shop.findById(adSpot.shopId);
        if (shop) {
          creator = {
            id: shop._id,
            name: shop.name,
            followers: shop.followers?.length || 0,
            isFollowed: currentUserId ? shop.followers?.some(
              (f: any) => f.userId.toString() === currentUserId
            ) : false,
            type: shop.type
          };
        }
      }

      return NextResponse.json({
        ...adSpot.toObject(),
        creator
      });
    } else {
      let isUserFollowing: any;
      let isUserFollower: any;
      let isPlaceFollower: any;
      let isPlaceOrganizerFollowing: any;
      let isPlaceOrganizerFollower: any;
      let isShopFollower: any;
      let isShopOrganizerFollowing: any;
      let isShopOrganizerFollower: any;

      // Get current user's following and followers lists
      const currentUser = currentUserId ? await User.findById(currentUserId) : null;
      const userFollowingIds = currentUser?.following?.map(f => f.userId.toString()) || [];
      const userFollowerIds = currentUser?.followers?.map(f => f.userId.toString()) || [];

      // Build query based on placeId or shopId
      const query: any = { isDeleted: { $ne: true } };
      if (placeId) {
        query.placeId = placeId;
      } else if (shopId) {
        query.shopId = shopId;
      }

      // Get ALL ad spots that match the query (no skip/limit yet)
      const adSpots = await AdSpot.find(query)
        .sort({ createdAt: -1 })
        .lean();

      // Get creator info and calculate priority for all ad spots
      const adSpotsWithPriority = await Promise.all(
        adSpots.map(async (adSpot) => {
          let creator;
          let priority = 0;

          // Get creator info and calculate priority based on place or shop
          if (adSpot.placeId) {
            const place = await Place.findById(adSpot.placeId);
            if (place) {
              creator = {
                id: place._id,
                name: place.name,
                type: place.type
              };
              
              // Get place followers list
              const placeFollowerIds = place?.followers?.map(f => f.userId.toString()) || [];

              const placeOrganizer = await User.findById(place.organizer.id);
              if (placeOrganizer) {
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
          } else if (adSpot.shopId) {
            const shop = await Shop.findById(adSpot.shopId);
            if (shop) {
              creator = {
                id: shop._id,
                name: shop.name,
                type: shop.type
              };

              // Get shop followers list
              const shopFollowerIds = shop?.followers?.map(f => f.userId.toString()) || [];

              const shopOrganizer = await User.findById(shop.organizer.id);
              if (shopOrganizer) {
                // Get shopOrganizer following and followers lists
                const shopOrganizerFollowingIds = shopOrganizer?.following?.map(f => f.userId.toString()) || [];
                const shopOrganizerFollowerIds = shopOrganizer?.followers?.map(f => f.userId.toString()) || [];
                
                // Calculate priority based on following status
                isShopFollower = shopFollowerIds.includes(currentUser?._id.toString());
                isShopOrganizerFollowing = shopOrganizerFollowingIds.includes(currentUser?._id.toString());
                isShopOrganizerFollower = shopOrganizerFollowerIds.includes(currentUser?._id.toString());
                
                if (isShopFollower && isShopOrganizerFollowing && isShopOrganizerFollower) priority = 100;
                else if (isShopOrganizerFollowing && isShopOrganizerFollower) priority = 85;
                else if (isShopOrganizerFollowing) priority = 70;
                else if (isShopOrganizerFollower) priority = 55;
                else priority = 40;
              }
            }
          }

          // Add recency factor (0-100 points)
          const ageInHours = (Date.now() - new Date(adSpot.createdAt).getTime()) / (1000 * 60 * 60);
          const recencyScore = Math.max(0, 100 - ageInHours);
          priority += recencyScore;

          if (page === 1) {
            // Reduce priority based on views
            if (currentUserId) {
              const userViews = adSpot.views.find(v => v.userId.toString() === currentUserId);
              if (userViews) {
                if (isPlaceFollower && isPlaceOrganizerFollowing && isPlaceOrganizerFollower) {
                  priority = Math.max(0, priority - (userViews.viewCount * 25));
                } else if (isShopFollower && isShopOrganizerFollowing && isShopOrganizerFollower) {
                  priority = Math.max(0, priority - (userViews.viewCount * 25));
                } else if (isPlaceOrganizerFollowing && isPlaceOrganizerFollower) {
                  priority = Math.max(0, priority - (userViews.viewCount * 21.25));
                } else if (isShopOrganizerFollowing && isShopOrganizerFollower) {
                  priority = Math.max(0, priority - (userViews.viewCount * 21.25));
                } else if (isPlaceOrganizerFollowing || isShopOrganizerFollowing) {
                  priority = Math.max(0, priority - (userViews.viewCount * 17.5));
                } else if (isPlaceOrganizerFollower || isShopOrganizerFollower) {
                  priority = Math.max(0, priority - (userViews.viewCount * 13.75));
                } else {
                  priority = Math.max(0, priority - (userViews.viewCount * 10));
                }
              }
            }
          }

          return {
            ...adSpot,
            priority,
            creator
          };
        })
      );

      // Sort by priority and apply pagination
      const sortedAdSpots = adSpotsWithPriority.sort((a, b) => b.priority - a.priority);
      const total = sortedAdSpots.length;
      const paginatedAdSpots = sortedAdSpots.slice((page - 1) * limit, page * limit);

      return NextResponse.json({
        adSpots: paginatedAdSpots,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    }
  } catch (error) {
    console.error('Error fetching ad spots:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}