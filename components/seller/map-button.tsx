'use client';

import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { SafetyNoticeModal } from '@/components/seller/safety-notice-modal';
import { trackAnalyticsEventClient } from '@/lib/supabase-queries-client';

interface MapButtonProps {
  locationUrl: string;
  sellerName?: string;
  className?: string;
  onClick?: () => void;
}

export function MapButton({ 
  locationUrl, 
  sellerName = 'Seller',
  className = '',
  onClick 
}: MapButtonProps) {
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  const handleButtonClick = () => {
    setShowSafetyModal(true);
  };

  const handleConfirm = async () => {
    setShowSafetyModal(false);
    
    // Track map click
    try {
      await trackAnalyticsEventClient({
        event_type: 'map_click',
        metadata: { 
          location_url: locationUrl,
          seller_name: sellerName 
        }
      });
    } catch (error) {
      console.error('Error tracking map click:', error);
    }
    
    if (onClick) onClick();
    window.open(locationUrl, '_blank');
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className={`flex items-center justify-center gap-2 w-full rounded-xl bg-purple-600 px-4 py-3 font-medium text-white hover:bg-purple-700 min-h-[48px] ${className}`}
      >
        <MapPin className="w-4 h-4" />
        <span className="text-sm sm:text-base">View Location</span>
      </button>
      
      <SafetyNoticeModal
        open={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        onConfirm={handleConfirm}
        actionType="map"
        sellerName={sellerName}
      />
    </>
  );
}