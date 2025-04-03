'use client';

import { getUserData } from '@/lib/storage';

export async function fetchEvents(page = 1, limit = 4) {
  try {
    const userData = getUserData();
    const response = await fetch(`/api/events/get?currentUserId=${userData?.id || ''}&page=${page}&limit=${limit}`);
    
    const data = await response.json();
    return data.events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}
