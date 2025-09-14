'use client';

import React from 'react';
import { X, Send, Phone, Mail, User, Shield, Star, AlertTriangle } from 'lucide-react';
import { WhatsAppButton } from '@/components/seller/whatsapp-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { trackAnalyticsEventClient } from '@/lib/supabase-queries-client';
import { VerifiedBadge } from '@/components/seller/verified-badge';

interface Listing {
  _id: string;
  title: string;
  price: number;
  priceType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  availability: 'available' | 'rented' | 'maintenance';
}

interface Seller {
  id: string;
  username: string;
  tier: 'basic' | 'premium' | 'gold';
  isVerified: boolean;
  rating?: number;
  reviewCount?: number;
  responseTime?: string;
  profile?: {
    business_name?: string;
    phone?: string;
    email?: string;
    city?: string;
    bio?: string;
  };
}

interface ContactSellerModalProps {
  listing: Listing;
  seller: Seller;
  onClose: () => void;
}

const tierConfig = {
  basic: { color: 'bg-gray-100 text-gray-700', icon: '🥉', label: 'Basic' },
  premium: { color: 'bg-blue-100 text-blue-700', icon: '🥈', label: 'Premium' },
  gold: { color: 'bg-yellow-100 text-yellow-700', icon: '🥇', label: 'Gold' }
};

const contactTemplates = [
  "Hi! I'm interested in renting this item. Is it still available?",
  "Hello! Could you please provide more details about this rental?",
  "Hi! I'd like to know about the availability and rental terms.",
  "Hello! Can we arrange a time to inspect the item?",
];

export function ContactSellerModal({ listing, seller, onClose }: ContactSellerModalProps) {
  const [contactMethod, setContactMethod] = React.useState<'phone' | 'email'>('phone');
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    email: '',
    message: contactTemplates[0],
    rentalDates: {
      start: '',
      end: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const formatPrice = (price: number, priceType: string) => {
    const formatted = new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    const typeMap = {
      hourly: '/hr',
      daily: '/day', 
      weekly: '/week',
      monthly: '/month'
    };

    return `${formatted}${typeMap[priceType as keyof typeof typeMap] || '/' + priceType}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Track contact attempt using trackAnalyticsEventClient
      await trackAnalyticsEventClient({
        event_type: 'contact_click',
        listing_id: listing._id,
        metadata: { 
          contact_method: contactMethod,
          seller_id: seller.id 
        }
      });

      // Simulate message sending (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      
      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateSelect = (template: string) => {
    setFormData(prev => ({ ...prev, message: template }));
  };

  const handlePhoneCall = async () => {
    if (seller.profile?.phone) {
      window.location.href = `tel:${seller.profile.phone}`;
      
      // Track phone call using trackAnalyticsEventClient
      try {
        await trackAnalyticsEventClient({
          event_type: 'contact_click',
          listing_id: listing._id,
          metadata: { 
            contact_method: 'phone',
            seller_id: seller.id 
          }
        });
      } catch (error) {
        console.error('Error tracking phone call:', error);
      }
    }
  };

  const handleEmailContact = async () => {
    if (seller.profile?.email) {
      const subject = encodeURIComponent(`Inquiry about: ${listing.title}`);
      const body = encodeURIComponent(formData.message);
      window.location.href = `mailto:${seller.profile.email}?subject=${subject}&body=${body}`;
      
      // Track email contact using trackAnalyticsEventClient
      try {
        await trackAnalyticsEventClient({
          event_type: 'contact_click',
          listing_id: listing._id,
          metadata: { 
            contact_method: 'email',
            seller_id: seller.id 
          }
        });
      } catch (error) {
        console.error('Error tracking email contact:', error);
      }
    }
  };

  if (submitSuccess) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
            <p className="text-muted-foreground mb-4">
              Your message has been sent to {seller.profile?.business_name || seller.username}.
              They typically respond within {seller.responseTime || '1 hour'}.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Contact Seller
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Listing Info */}
          <div className="bg-muted/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2 line-clamp-2">{listing.title}</h4>
            <div className="flex items-center justify-between text-sm">
              <Badge className={cn(
                "text-xs",
                listing.availability === 'available' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              )}>
                {listing.availability === 'available' ? 'Available Now' : 'Not Available'}
              </Badge>
              <span className="font-semibold text-primary">
                {formatPrice(listing.price, listing.priceType)}
              </span>
            </div>
          </div>

          {/* Seller Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/10 rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${seller.username}`} />
              <AvatarFallback>
                {seller.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">
                  {seller.profile?.business_name || seller.username}
                </h4>
                {seller.isVerified && (
                  <VerifiedBadge size="sm" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge className={cn("text-xs", tierConfig[seller.tier].color)}>
                  {tierConfig[seller.tier].icon} {tierConfig[seller.tier].label}
                </Badge>
                {seller.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{seller.rating.toFixed(1)}</span>
                    {seller.reviewCount && (
                      <span>({seller.reviewCount} reviews)</span>
                    )}
                  </div>
                )}
              </div>
              {seller.responseTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  Typically responds within {seller.responseTime}
                </p>
              )}
            </div>
          </div>

          {/* Contact Method Tabs */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            {seller.profile?.phone && (
              <Button
                variant={contactMethod === 'phone' ? "primary" : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setContactMethod('phone')}
              >
                <Phone className="w-4 h-4 mr-1" />
                Phone
              </Button>
            )}
            {seller.profile?.email && (
              <Button
                variant={contactMethod === 'email' ? 'primary' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setContactMethod('email')}
              >
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
            )}
          </div>

          {/* Contact Forms */}
          {contactMethod === 'phone' && seller.profile?.phone && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <Phone className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Call {seller.profile?.business_name || seller.username}</h4>
                <p className="text-2xl font-bold text-primary mb-4">{seller.profile?.phone}</p>
                <Button onClick={handlePhoneCall} className="w-full max-w-xs">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Or message on WhatsApp:</p>
                  <WhatsAppButton 
                    phoneNumber={seller.profile.phone} 
                    sellerName={seller.profile?.business_name || seller.username}
                    className="w-full max-w-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {contactMethod === 'email' && seller.profile?.email && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    placeholder="+92 XXX XXXXXXX"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Quick Templates */}
              <div>
                <Label>Quick Message Templates</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {contactTemplates.map((template, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-left h-auto p-2 text-xs"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      {template}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="message">Your Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  required
                  placeholder="Enter your message..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>By sending this message, you agree to our Terms of Service and Privacy Policy.</span>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          )}

          {contactMethod === 'email' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Email {seller.profile?.business_name || seller.username}</h4>
                <p className="text-lg text-muted-foreground mb-4">{seller.profile?.email}</p>
                <Button onClick={handleEmailContact} className="w-full max-w-xs">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          )}

          {/* Safety Notice */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Safety Notice:</strong> Always meet in a public place, inspect the item thoroughly, 
              and never send money in advance. RentParLo.pk is not responsible for transactions between users.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ContactSellerModal;