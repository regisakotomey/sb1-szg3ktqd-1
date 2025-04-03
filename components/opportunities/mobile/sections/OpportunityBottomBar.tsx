'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';

interface OpportunityBottomBarProps {
  opportunityId: string;
  isOwner: boolean;
  isInterested: boolean;
  onToggleInterest: (newState: boolean) => void;
}

export default function OpportunityBottomBar({
  opportunityId,
  isOwner,
  isInterested,
  onToggleInterest,
}: OpportunityBottomBarProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleInterest = async () => {
    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/mobile/login');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/interest`, {
        method: isInterested ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id })
      });

      if (!response.ok) throw new Error('Failed to update interest status');

      onToggleInterest(!isInterested);
    } catch (error) {
      console.error('Error updating interest status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isOwner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <button
        onClick={handleInterest}
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
          isInterested
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
        ) : (
          isInterested ? 'Intéressé' : "Je suis intéressé"
        )}
      </button>
    </div>
  );
}