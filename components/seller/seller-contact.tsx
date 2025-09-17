'use client';

import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhatsAppButton } from '@/components/seller/whatsapp-button';
import { CallButton } from '@/components/seller/call-button';
import { MapButton } from '@/components/seller/map-button';
import { trackAnalyticsEventClient } from '@/lib/supabase-queries-client';

interface Seller {
  id: string;
  username: string;
  business_name?: string;
  phone?: string;
  email?: string;
  locationUrl?: string;
}

interface SellerContactProps {
  seller: Seller;
  onContact: () => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export function SellerContact({ 
  seller, 
  onContact, 
  variant = 'default',
  className 
}: SellerContactProps) {
  const displayName = seller.business_name || seller.username;

  const handleEmail = async () => {
    if (seller.email) {
      const subject = encodeURIComponent(`Inquiry from RentParLo.pk - ${displayName}`);
      const body = encodeURIComponent(`Hi ${displayName},\n\nI found your profile on RentParLo.pk and I'm interested in your rental items.\n\nBest regards`);
      window.location.href = `mailto:${seller.email}?subject=${subject}&body=${body}`;
      onContact();
      
      // Track email contact using trackAnalyticsEventClient
      try {
        await trackAnalyticsEventClient({
          event_type: 'contact_click',
          metadata: { contact_method: 'email', source: 'seller_profile', seller_id: seller.id }
        });
      } catch (error) {
        console.error('Error tracking email contact:', error);
      }
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {seller.phone && (
          <Button size="sm" variant="outline" onClick={() => {}}>
            <Phone className="w-4 h-4" />
          </Button>
        )}
        {seller.email && (
          <Button size="sm" variant="outline" onClick={handleEmail}>
            <Mail className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  // Check if seller has any contact method
  const hasContactMethods = seller.phone || seller.email || seller.locationUrl;

  if (!hasContactMethods) {
    return (
      <Button disabled className={className}>
        <Phone className="w-4 h-4 mr-2" />
        Contact Unavailable
      </Button>
    );
  }

  // Display all available contact buttons with the specified layout
  return (
    <div className="flex flex-col gap-2 w-full">
      {seller.phone && (
        <div className="w-full">
          <WhatsAppButton 
            phoneNumber={seller.phone} 
            sellerName={displayName}
            onClick={onContact}
            className="w-full cursor-pointer"
          />
        </div>
      )}
      
      {/* Stacked layout for screens < 400px, side-by-side for larger screens */}
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full">
        {seller.phone && (
          <div className="w-full sm:w-1/2">
            <CallButton 
              phoneNumber={seller.phone} 
              sellerName={displayName}
              onClick={onContact}
              className="w-full cursor-pointer"
            />
          </div>
        )}
        
        <div className="w-full sm:w-1/2">
          {seller.locationUrl ? (
            <MapButton 
              locationUrl={seller.locationUrl} 
              sellerName={displayName}
              onClick={onContact}
              className="w-full cursor-pointer"
            />
          ) : (
            <Button 
              variant="outline" 
              disabled
              className="w-full flex items-center justify-center gap-2 h-full cursor-not-allowed opacity-50"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Map</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerContact;