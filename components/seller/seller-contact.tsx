'use client';

import React from 'react';
import { Phone, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface Seller {
  id: string;
  username: string;
  business_name?: string;
  phone?: string;
  email?: string;
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

  const handlePhoneCall = () => {
    if (seller.phone) {
      window.location.href = `tel:${seller.phone}`;
      onContact();
      
      // Track phone call
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'contact_click',
          seller_id: seller.id,
          metadata: { contact_method: 'phone', source: 'seller_profile' }
        })
      }).catch(console.error);
    }
  };

  const handleEmail = () => {
    if (seller.email) {
      const subject = encodeURIComponent(`Inquiry from RentParLo.pk - ${displayName}`);
      const body = encodeURIComponent(`Hi ${displayName},\n\nI found your profile on RentParLo.pk and I'm interested in your rental items.\n\nBest regards`);
      window.location.href = `mailto:${seller.email}?subject=${subject}&body=${body}`;
      onContact();
      
      // Track email contact
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'contact_click',
          seller_id: seller.id,
          metadata: { contact_method: 'email', source: 'seller_profile' }
        })
      }).catch(console.error);
    }
  };

  const handleWhatsApp = () => {
    if (seller.phone) {
      // Clean phone number for WhatsApp
      const cleanPhone = seller.phone.replace(/\D/g, '');
      const whatsappPhone = cleanPhone.startsWith('92') ? cleanPhone : `92${cleanPhone.replace(/^0/, '')}`;
      const message = encodeURIComponent(`Hi ${displayName}, I found your profile on RentParLo.pk and I'm interested in your rental items.`);
      
      window.open(`https://wa.me/${whatsappPhone}?text=${message}`, '_blank');
      onContact();
      
      // Track WhatsApp contact
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'WhatsApp_click',
          seller_id: seller.id,
          metadata: { contact_method: 'whatsapp', source: 'seller_profile' }
        })
      }).catch(console.error);
    }
  };

  const handleMessage = () => {
    // For now, redirect to WhatsApp or show a modal for internal messaging
    if (seller.phone) {
      handleWhatsApp();
    } else {
      // Could implement internal messaging system here
      alert('Internal messaging system will be implemented soon. Please use other contact methods.');
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {seller.phone && (
          <>
            <Button size="sm" onClick={handleWhatsApp} className="bg-green-600 hover:bg-green-700">
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handlePhoneCall}>
              <Phone className="w-4 h-4" />
            </Button>
          </>
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
  const hasContactMethods = seller.phone || seller.email;

  if (!hasContactMethods) {
    return (
      <Button disabled className={className}>
        <MessageCircle className="w-4 h-4 mr-2" />
        Contact Unavailable
      </Button>
    );
  }

  // If only one contact method, show direct button
  if (seller.phone && !seller.email) {
    return (
      <Button onClick={handleWhatsApp} className={`bg-green-600 hover:bg-green-700 ${className}`}>
        <MessageCircle className="w-4 h-4 mr-2" />
        Contact on WhatsApp
      </Button>
    );
  }

  if (seller.email && !seller.phone) {
    return (
      <Button onClick={handleEmail} className={className}>
        <Mail className="w-4 h-4 mr-2" />
        Send Email
      </Button>
    );
  }

  // Multiple contact methods - show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={`bg-green-600 hover:bg-green-700 ${className}`}>
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact Seller
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {seller.phone && (
          <>
            <DropdownMenuItem onClick={handleWhatsApp} className="cursor-pointer">
              <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
              <div className="flex flex-col">
                <span>WhatsApp</span>
                <span className="text-xs text-muted-foreground">Send message instantly</span>
              </div>
              <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePhoneCall} className="cursor-pointer">
              <Phone className="w-4 h-4 mr-2 text-blue-600" />
              <div className="flex flex-col">
                <span>Call</span>
                <span className="text-xs text-muted-foreground">{seller.phone}</span>
              </div>
            </DropdownMenuItem>
          </>
        )}
        
        {seller.email && (
          <>
            {seller.phone && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={handleEmail} className="cursor-pointer">
              <Mail className="w-4 h-4 mr-2 text-orange-600" />
              <div className="flex flex-col">
                <span>Email</span>
                <span className="text-xs text-muted-foreground">Send email message</span>
              </div>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleMessage} className="cursor-pointer">
          <MessageCircle className="w-4 h-4 mr-2 text-purple-600" />
          <div className="flex flex-col">
            <span>Send Message</span>
            <span className="text-xs text-muted-foreground">Internal messaging</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SellerContact;