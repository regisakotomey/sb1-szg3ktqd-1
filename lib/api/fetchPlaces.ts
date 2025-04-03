'use client';

import { getUserData } from '@/lib/storage';

export async function fetchPlaces(page = 1, limit = 4) {
  try {
    const userData = getUserData();
    const response = await fetch(`/api/places/get?currentUserId=${userData?.id || ''}&page=${page}&limit=${limit}`);
    
    const data = await response.json();
    return data.places;
  } catch (error) {
    console.error('Error fetching places:', error);
    return [];
  }
}
