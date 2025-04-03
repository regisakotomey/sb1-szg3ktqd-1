'use client';

import { getUserData } from '@/lib/storage';

export async function fetchOpportunities(page = 1, limit = 4) {
  try {
      const userData = getUserData();
      const response = await fetch(`/api/opportunities/get?currentUserId=${userData?.id || ''}&page=${page}&limit=${limit}`);
    
    const data = await response.json();
    return data.opportunities;
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return [];
  }
}
