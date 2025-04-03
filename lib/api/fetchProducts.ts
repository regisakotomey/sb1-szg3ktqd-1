'use client';

import { getUserData } from '@/lib/storage';

export async function fetchProducts(page = 1, limit = 4) {
  try {
    const userData = getUserData();
    const response = await fetch(`/api/products/get?currentUserId=${userData?.id || ''}&page=${page}&limit=${limit}`);
  
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}