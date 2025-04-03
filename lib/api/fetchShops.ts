'use client';

import { getUserData } from '@/lib/storage';

export async function fetchShops(page = 1, limit = 4) {
  try {
    const userData = getUserData();
    const response = await fetch(`/api/shops/get?currentUserId=${userData?.id || ''}&page=${page}&limit=${limit}`);
  
  const data = await response.json();
  return data.shops;
  } catch (error) {
    console.error('Error fetching shops:', error);
    return [];
  }
}