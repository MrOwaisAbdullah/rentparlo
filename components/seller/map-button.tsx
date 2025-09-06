'use client';

import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { SafetyNoticeModal } from '@/components/seller/safety-notice-modal';

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

  const handleConfirm = () => {
    setShowSafetyModal(false);
    if (onClick) onClick();
    window.open(locationUrl, '_blank');
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className={`flex items-center justify-center gap-2 w-full rounded-xl bg-purple-600 p-3 font-medium text-white hover:bg-purple-700 ${className}`}
      >
        <MapPin className="w-4 h-4" />
        View Location
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