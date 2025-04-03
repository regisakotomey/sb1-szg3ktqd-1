'use client';

import { useState } from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import { getUserData } from '@/lib/storage';
import { Event } from '@/types/event';

export function useEventActions(event: Event | null, router: AppRouterInstance) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href
      });
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    try {
      const response = await fetch('/api/events/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event._id,
          userId: getUserData()?.id
        }),
      });

      if (!response.ok) throw new Error('Failed to delete event');

      router.push('/content/events');
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSponsor = () => {
    // Implement sponsorship logic
  };

  const handleEdit = () => {
    // Implement edit logic
  };

  const handleReport = () => {
    // Implement report logic
  };

  return {
    handleShare,
    handleDelete,
    handleSponsor,
    handleEdit,
    handleReport
  };
}