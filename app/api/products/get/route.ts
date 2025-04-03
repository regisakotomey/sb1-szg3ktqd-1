import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import { Shop } from '@/models/Shop';
import { User } from '@/models/User';
import { Place } from '@/models/Place';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');
    const shopId = searchParams.get('shopId');
    const currentUserId = searchParams.get('currentUserId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectDB();

    if (productId) {
      // Get specific product
      const product = await Product.findOne({ 
        _id: productId,
        isDeleted: { $ne: true }
      });
      
      if (!product) {
        return NextResponse.json(
          { error: 'Produit non trouvé' },
          { status: 404 }
        );
      }

      // Get shop info
      const shop = await Shop.findById(product.shopId);
      if (shop) {
        // Get shop owner info
        let shopOwner;
        if (shop.organizer.type === 'place') {
          const place = await Place.findById(shop.organizer.id);
          if (place) {
            shopOwner = {
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
            shopOwner = {
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

        product.shop = {
          id: shop._id,
          name: shop.name,
          followers: shop.followers?.length || 0,
          isFollowed: currentUserId ? shop.followers?.some(
            (f: any) => f.userId.toString() === currentUserId
          ) : false,
          owner: shopOwner
        };
      }

      return NextResponse.json(product);
    } else {
      let isUserFollowing: any;
      let isUserFollower: any;
      let isShopFollower: any;
      let isShopOrganizerFollowing: any;
      let isShopOrganizerFollower: any;

      // Get current user's following and followers lists
      const currentUser = currentUserId ? await User.findById(currentUserId) : null;
      const userFollowingIds = currentUser?.following?.map(f => f.userId.toString()) || [];
      const userFollowerIds = currentUser?.followers?.map(f => f.userId.toString()) || [];

      // Build query based on shopId
      const query: any = { isDeleted: { $ne: true } };
      if (shopId) {
        query.shopId = shopId;
      }

      // Get ALL products that match the query (no skip/limit yet)
      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .lean();

      // Get shop info and calculate priority for all products
      const productsWithPriority = await Promise.all(
        products.map(async (product) => {
          let priority = 0;
          const shop = await Shop.findById(product.shopId);

          if (shop) {
            // Get shop followers list
            const shopFollowerIds = shop.followers?.map(f => f.userId.toString()) || [];

            if (shop.organizer.type === 'place') {
              const place = await Place.findById(shop.organizer.id);
              if (place) {
                const placeOrganizer = await User.findById(place.organizer.id);
                if (placeOrganizer) {
                  // Get placeOrganizer following and followers lists
                  const placeOrganizerFollowingIds = placeOrganizer?.following?.map(f => f.userId.toString()) || [];
                  const placeOrganizerFollowerIds = placeOrganizer?.followers?.map(f => f.userId.toString()) || [];
                  
                  // Calculate priority based on following status
                  isShopFollower = shopFollowerIds.includes(currentUser?._id.toString());
                  isShopOrganizerFollowing = placeOrganizerFollowingIds.includes(currentUser?._id.toString());
                  isShopOrganizerFollower = placeOrganizerFollowerIds.includes(currentUser?._id.toString());
                  
                  if (isShopFollower && isShopOrganizerFollowing && isShopOrganizerFollower) priority = 100;
                  else if (isShopOrganizerFollowing && isShopOrganizerFollower) priority = 85;
                  else if (isShopOrganizerFollowing) priority = 70;
                  else if (isShopOrganizerFollower) priority = 55;
                  else priority = 40;
                }
              }
            } else {
              const user = await User.findById(shop.organizer.id);
              if (user) {
                // Calculate priority based on following status
                isUserFollowing = userFollowingIds.includes(user._id.toString());
                isUserFollower = userFollowerIds.includes(user._id.toString());
                
                if (isUserFollowing && isUserFollower) priority = 100;
                else if (isUserFollowing) priority = 85;
                else if (isUserFollower) priority = 70;
                else priority = 40;
              }
            }

            if (page === 1) {
              // Reduce priority based on views
              if (currentUserId) {
                const userViews = product.views.find(v => v.userId.toString() === currentUserId);
                if (userViews) {
                  if (isShopFollower && isShopOrganizerFollowing && isShopOrganizerFollower) {
                    priority = Math.max(0, priority - (userViews.viewCount * 25));
                  } else if (isUserFollowing && isUserFollower) {
                    priority = Math.max(0, priority - (userViews.viewCount * 25));
                  } else if (isShopOrganizerFollowing && isShopOrganizerFollower) {
                    priority = Math.max(0, priority - (userViews.viewCount * 21.25));
                  } else if (isUserFollowing) {
                    priority = Math.max(0, priority - (userViews.viewCount * 21.25));
                  } else if (isShopOrganizerFollowing) {
                    priority = Math.max(0, priority - (userViews.viewCount * 17.5));
                  } else if (isUserFollower) {
                    priority = Math.max(0, priority - (userViews.viewCount * 17.5));
                  } else if (isShopOrganizerFollower) {
                    priority = Math.max(0, priority - (userViews.viewCount * 13.75));
                  } else {
                    priority = Math.max(0, priority - (userViews.viewCount * 10));
                  }
                }
              }
            }
          }

          return {
            ...product,
            priority,
            shop: shop ? {
              id: shop._id,
              name: shop.name
            } : null
          };
        })
      );

      // Sort by priority and apply pagination
      const sortedProducts = productsWithPriority.sort((a, b) => b.priority - a.priority);
      const total = sortedProducts.length;
      const paginatedProducts = sortedProducts.slice((page - 1) * limit, page * limit);

      return NextResponse.json({
        products: paginatedProducts,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}