import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/models/Event';
import { Place } from '@/models/Place';
import { Opportunity } from '@/models/Opportunity';
import { Shop } from '@/models/Shop';
import { Product } from '@/models/Product';
import { User } from '@/models/User';
import { AdSpot } from '@/models/AdSpot';
import { calculateRelevanceScore, getSearchUrl } from '@/lib/search/searchUtils';
import { SearchResult } from '@/types/search';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const types = searchParams.get('types')?.split(',') || [];
    const date = searchParams.get('date');
    const location = searchParams.get('location');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json({ results: [], total: 0 });
    }

    await connectDB();

    // Normaliser la requête pour la recherche
    const normalizedQuery = query.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Préparer les conditions de recherche avec les mots normalisés
    const searchWords = normalizedQuery.split(/\s+/).filter(word => word.length > 1);
    const searchRegexes = searchWords.map(word => new RegExp(word, 'i'));

    // Prepare date filters for events
    let dateFilter = {};
    if (date) {
      const now = new Date();
      switch (date) {
        case 'today':
          dateFilter = {
            startDate: { $gte: startOfDay(now), $lte: endOfDay(now) }
          };
          break;
        case 'tomorrow':
          const tomorrow = new Date(now.setDate(now.getDate() + 1));
          dateFilter = {
            startDate: { $gte: startOfDay(tomorrow), $lte: endOfDay(tomorrow) }
          };
          break;
        case 'week':
          dateFilter = {
            startDate: { $gte: startOfWeek(now), $lte: endOfWeek(now) }
          };
          break;
        case 'month':
          dateFilter = {
            startDate: { $gte: startOfMonth(now), $lte: endOfMonth(now) }
          };
          break;
      }
    }

    // Prepare price filter
    let priceFilter = {};
    if (minPrice || maxPrice) {
      priceFilter = {
        price: {
          ...(minPrice && { $gte: parseFloat(minPrice) }),
          ...(maxPrice && { $lte: parseFloat(maxPrice) })
        }
      };
    }

    // Prepare location filter
    let locationFilter = {};
    if (location) {
      locationFilter = {
        $or: [
          { 'address': { $regex: location, $options: 'i' } },
          { 'locationDetails': { $regex: location, $options: 'i' } },
          { 'country': { $regex: location, $options: 'i' } }
        ]
      };
    }

    // Prepare base search conditions with regex patterns
    const searchConditions = {
      isDeleted: { $ne: true },
      $and: searchRegexes.map(regex => ({
        $or: [
          { title: regex },
          { description: regex }
        ]
      }))
    };

    // Fetch data based on selected types (or all if none selected)
    const [events, places, opportunities, shops, products, users, ads] = await Promise.all([
      types.length === 0 || types.includes('event') ? 
        Event.find({ 
          ...searchConditions, 
          ...dateFilter,
          ...locationFilter
        }).lean() : [],
      
      types.length === 0 || types.includes('place') ? 
        Place.find({ 
          ...searchConditions,
          ...locationFilter
        }).lean() : [],
      
      types.length === 0 || types.includes('opportunity') ? 
        Opportunity.find({ 
          ...searchConditions,
          ...locationFilter
        }).lean() : [],
      
      types.length === 0 || types.includes('shop') ? 
        Shop.find({ 
          ...searchConditions,
          ...locationFilter
        }).lean() : [],
      
      types.length === 0 || types.includes('product') ? 
        Product.find({ 
          ...searchConditions,
          ...priceFilter
        }).lean() : [],
      
      types.length === 0 || types.includes('user') ? 
        User.find({
          isAnonymous: false,
          $or: [
            { firstName: { $regex: normalizedQuery, $options: 'i' } },
            { lastName: { $regex: normalizedQuery, $options: 'i' } }
          ]
        }).lean() : [],
      
      types.length === 0 || types.includes('ad') ? 
        AdSpot.find({ 
          isDeleted: { $ne: true }
        }).lean() : []
    ]);

    // Transform and score results
    const results: SearchResult[] = [
      ...events.map(event => ({
        id: event._id.toString(),
        type: 'Evènement' as const,
        title: event.title,
        description: event.description,
        image: event.mainMedia,
        date: event.startDate,
        location: event.address,
        score: calculateRelevanceScore(query, event.title, 1.2) + 
               calculateRelevanceScore(query, event.description, 0.8),
        url: getSearchUrl('event', event._id.toString())
      })),

      ...places.map(place => ({
        id: place._id.toString(),
        type: 'Lieu' as const,
        title: place.name,
        description: place.shortDescription,
        image: place.mainImage,
        location: place.locationDetails,
        score: calculateRelevanceScore(query, place.name, 1.2) + 
               calculateRelevanceScore(query, place.shortDescription, 0.8) +
               calculateRelevanceScore(query, place.longDescription, 0.5),
        url: getSearchUrl('place', place._id.toString())
      })),

      ...opportunities.map(opportunity => ({
        id: opportunity._id.toString(),
        type: 'Opportunité' as const,
        title: opportunity.title,
        description: opportunity.description,
        image: opportunity.mainImage,
        location: opportunity.locationDetails,
        score: calculateRelevanceScore(query, opportunity.title, 1.2) + 
               calculateRelevanceScore(query, opportunity.description, 0.8),
        url: getSearchUrl('opportunity', opportunity._id.toString())
      })),

      ...shops.map(shop => ({
        id: shop._id.toString(),
        type: 'Boutique' as const,
        title: shop.name,
        description: shop.description,
        image: shop.logo,
        score: calculateRelevanceScore(query, shop.name, 1.2) + 
               calculateRelevanceScore(query, shop.description, 0.8),
        url: getSearchUrl('shop', shop._id.toString())
      })),

      ...products.map(product => ({
        id: product._id.toString(),
        type: 'Article' as const,
        title: product.name,
        description: product.description,
        image: product.media[0]?.url,
        price: product.price,
        score: calculateRelevanceScore(query, product.name, 1.2) + 
               calculateRelevanceScore(query, product.description, 0.8),
        url: getSearchUrl('product', product._id.toString())
      })),

      ...users.map(user => ({
        id: user._id.toString(),
        type: 'Utilisateur' as const,
        title: `${user.firstName} ${user.lastName}`,
        score: calculateRelevanceScore(query, `${user.firstName} ${user.lastName}`, 1),
        url: getSearchUrl('user', user._id.toString())
      }))
    ];

    // Sort by score and paginate
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .filter(result => result.score > 0);

    const total = sortedResults.length;
    const paginatedResults = sortedResults.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      results: paginatedResults,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}