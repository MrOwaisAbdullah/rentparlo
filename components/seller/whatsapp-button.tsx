'use client';

import React, { useState, forwardRef } from 'react';
import Image from 'next/image';
import { SafetyNoticeModal } from '@/components/seller/safety-notice-modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trackAnalyticsEventClient } from '@/lib/supabase-queries-client';

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  sellerName?: string;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size?: 'default' | 'compact' | 'auto';
}

export const WhatsAppButton = forwardRef<HTMLButtonElement, WhatsAppButtonProps>(({ 
  phoneNumber, 
  message = 'Hi, I found your profile on RentParLo.pk and I\'m interested in your rental items.', 
  sellerName = 'Seller',
  className = '',
  onClick,
  size = 'default'
}, ref) => {
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const whatsappPhone = cleanPhone.startsWith('92') ? cleanPhone : `92${cleanPhone.replace(/^0/, '')}`;
  const encodedMessage = encodeURIComponent(message.replace('{sellerName}', sellerName));

  const handleButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Track WhatsApp click
    try {
      // We'll track this when the user confirms in the safety modal
    } catch (error) {
      console.error('Error tracking WhatsApp click:', error);
    }
    
    setShowSafetyModal(true);
    if (onClick) {
      onClick(e);
    }
  };

  const handleConfirm = async () => {
    setShowSafetyModal(false);
    
    // Track WhatsApp click
    try {
      // You'll need to pass listingId and sellerId to track this properly
      // For now, we'll just track the event type
      await trackAnalyticsEventClient({
        event_type: 'WhatsApp_click',
        metadata: { 
          phone_number: whatsappPhone,
          seller_name: sellerName 
        }
      });
    } catch (error) {
      console.error('Error tracking WhatsApp click:', error);
    }
    
    window.open(`https://wa.me/${whatsappPhone}?text=${encodedMessage}`, '_blank');
  };

  // Determine if we should show compact version
  const isCompact = size === 'compact' || (size === 'auto' && typeof window !== 'undefined' && window.innerWidth < 768);

  return (
    <>
      <Button
        ref={ref}
        onClick={handleButtonClick}
        className={cn(
          'bg-[#25D366] hover:bg-[#25D366]/90 text-white font-medium transition-transform transform hover:scale-[1.02]',
          isCompact ? 'p-2 w-12 h-12' : 'w-full h-12 gap-2',
          className
        )}
        data-whatsapp-button
      >
        <Image
          src="/whatsapp.png"
          alt="Message on WhatsApp"
          width={isCompact ? 24 : 24}
          height={isCompact ? 24 : 24}
        />
        {!isCompact && (
          <span>WhatsApp</span>
        )}
      </Button>
      
      <SafetyNoticeModal
        open={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        onConfirm={handleConfirm}
        actionType="whatsapp"
        sellerName={sellerName}
      />
    </>
  );
});

WhatsAppButton.displayName = 'WhatsAppButton';
