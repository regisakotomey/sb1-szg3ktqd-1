'use client';

import { ImagePlus, Calendar, Briefcase, Store } from 'lucide-react';
import { useState } from 'react';
import EventForm from '@/components/forms/EventForm';
import OpportunityForm from '@/components/forms/OpportunityForm';
import ShopForm from '@/components/forms/ShopForm';
import AdSpotForm from '@/components/forms/AdSpotForm';

interface PlaceCreationButtonsProps {
  placeId: string;
}

export default function PlaceCreationButtons({
  placeId
}: PlaceCreationButtonsProps) {
  const [showEventForm, setShowEventForm] = useState(false);
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [showShopForm, setShowShopForm] = useState(false);
  const [showAdSpotForm, setShowAdSpotForm] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setShowAdSpotForm(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <ImagePlus size={18} />
            <span>Créer un spot publicitaire</span>
          </button>
          <button
            onClick={() => setShowEventForm(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <Calendar size={18} />
            <span>Créer un événement</span>
          </button>
          <button
            onClick={() => setShowOpportunityForm(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <Briefcase size={18} />
            <span>Créer une opportunité</span>
          </button>
          <button
            onClick={() => setShowShopForm(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <Store size={18} />
            <span>Créer une boutique</span>
          </button>
        </div>
      </div>

      {showEventForm && (
        <EventForm 
          onClose={() => setShowEventForm(false)} 
          placeId={placeId}
        />
      )}

      {showOpportunityForm && (
        <OpportunityForm 
          onClose={() => setShowOpportunityForm(false)} 
          placeId={placeId}
        />
      )}

      {showShopForm && (
        <ShopForm
          onClose={() => setShowShopForm(false)}
          placeId={placeId}
        />
      )}

      {showAdSpotForm && (
        <AdSpotForm
          onClose={() => setShowAdSpotForm(false)}
          placeId={placeId}
        />
      )}
    </>
  );
}