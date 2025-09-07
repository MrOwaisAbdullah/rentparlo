'use client';

import React, { useState, forwardRef } from 'react';
import Image from 'next/image';
import { SafetyNoticeModal } from '@/components/seller/safety-notice-modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  sellerName?: string;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size?: 'default' | 'compact';
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

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowSafetyModal(true);
    if (onClick) {
      onClick(e);
    }
  };

  const handleConfirm = () => {
    setShowSafetyModal(false);
    window.open(`https://wa.me/${whatsappPhone}?text=${encodedMessage}`, '_blank');
  };

  const isCompact = size === 'compact';

  return (
    <>
      <Button
        ref={ref}
        onClick={handleButtonClick}
        className={cn(
          'bg-[#25D366] hover:bg-[#25D366]/90 text-white font-medium transition-transform transform hover:scale-[1.02]',
          isCompact ? 'p-2 w-16 h-12' : 'w-full h-12 gap-2',
          className
        )}
        data-whatsapp-button
      >
        <Image
          src="/whatsapp.png"
          alt="Message on WhatsApp"
          width={isCompact ? 32 : 24}
          height={isCompact ? 32 : 24}
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
