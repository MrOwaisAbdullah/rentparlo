'use client';

import React, { useState, forwardRef } from 'react';
import Image from 'next/image';
import { SafetyNoticeModal } from '@/components/seller/safety-notice-modal';

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  sellerName?: string;
  className?: string;
  onClick?: () => void;
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

  const handleButtonClick = () => {
    setShowSafetyModal(true);
  };

  const handleConfirm = () => {
    setShowSafetyModal(false);
    if (onClick) onClick();
    window.open(`https://wa.me/${whatsappPhone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <>
      <button
        ref={ref}
        onClick={handleButtonClick}
        className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-[#25D366] font-medium text-white transition-all after:absolute after:inset-0 after:bg-gradient-to-r after:from-white/0 after:to-white/10 hover:shadow-lg hover:shadow-[#25D366]/20 active:scale-[0.98] ${size === 'compact' ? 'w-16 h-12 p-2' : 'w-full gap-5 p-3 h-12'} ${className}`}
        data-whatsapp-button
      >
        <Image
          className={size === 'compact' ? 'p-1' : 'absolute left-3 p-1'}
          src="/whatsapp.png"
          alt="Message on WhatsApp"
          width={size === 'compact' ? 32 : 40}
          height={size === 'compact' ? 32 : 40}
        />
        {size !== 'compact' && (
          <span className="pl-12">Message on WhatsApp</span>
        )}
      </button>
      
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