'use client';

import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { SafetyNoticeModal } from '@/components/seller/safety-notice-modal';
import { trackAnalyticsEventClient } from '@/lib/supabase-queries-client';

interface CallButtonProps {
  phoneNumber: string;
  sellerName?: string;
  className?: string;
  onClick?: () => void;
}

export function CallButton({ 
  phoneNumber, 
  sellerName = 'Seller',
  className = '',
  onClick 
}: CallButtonProps) {
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  const handleButtonClick = () => {
    setShowSafetyModal(true);
  };

  const handleConfirm = async () => {
    setShowSafetyModal(false);
    
    // Track call click
    try {
      await trackAnalyticsEventClient({
        event_type: 'contact_click',
        metadata: { 
          contact_method: 'phone',
          phone_number: phoneNumber,
          seller_name: sellerName 
        }
      });
    } catch (error) {
      console.error('Error tracking call click:', error);
    }
    
    if (onClick) onClick();
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className={`flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 p-3 font-medium text-white hover:bg-blue-700 ${className}`}
      >
        <Phone className="w-4 h-4" />
        Call Seller
      </button>
      
      <SafetyNoticeModal
        open={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        onConfirm={handleConfirm}
        actionType="call"
        sellerName={sellerName}
      />
    </>
  );
}