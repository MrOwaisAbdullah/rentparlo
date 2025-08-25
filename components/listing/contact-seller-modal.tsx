'use client';

import React from 'react';
import { X, Send, Phone, Mail, MessageCircle, User, Shield, Star, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

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
  const [contactMethod, setContactMethod] = React.useState<'message' | 'phone' | 'email'>('message');
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
      hourly: 'per hour',
      daily: 'per day', 
      weekly: 'per week',
      monthly: 'per month'
    };

    return `${formatted} ${typeMap[priceType as keyof typeof typeMap] || priceType}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Track contact attempt
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'contact_click',
          listing_id: listing._id,
          metadata: { 
            contact_method: contactMethod,
            seller_id: seller.id 
          }
        })
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

  const handlePhoneCall = () => {
    if (seller.profile?.phone) {
      window.location.href = `tel:${seller.profile.phone}`;
      
      // Track phone call
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'contact_click',
          listing_id: listing._id,
          metadata: { seller_id: seller.id }
        })
      }).catch(console.error);
    }
  };

  const handleEmailContact = () => {
    if (seller.profile?.email) {
      const subject = encodeURIComponent(`Inquiry about: ${listing.title}`);
      const body = encodeURIComponent(formData.message);
      window.location.href = `mailto:${seller.profile.email}?subject=${subject}&body=${body}`;
      
      // Track email contact
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'contact_click',
          listing_id: listing._id,
          metadata: { seller_id: seller.id }
        })
      }).catch(console.error);
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
                  <Shield className="w-4 h-4 text-green-600" />
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
            <Button
              variant={contactMethod === 'message' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setContactMethod('message')}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Message
            </Button>
            {seller.profile?.phone && (
              <Button
                variant={contactMethod === 'phone' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setContactMethod('phone')}
              >
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
            )}
            {seller.profile?.email && (
              <Button
                variant={contactMethod === 'email' ? 'default' : 'ghost'}
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
          {contactMethod === 'message' && (
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
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  required
                  rows={4}
                  placeholder="Type your message here..."
                  className="resize-none"
                />
              </div>

              {/* Rental Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Preferred Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.rentalDates.start}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      rentalDates: { ...prev.rentalDates, start: e.target.value }
                    }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">Preferred End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formData.rentalDates.end}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      rentalDates: { ...prev.rentalDates, end: e.target.value }
                    }))}
                    min={formData.rentalDates.start || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || listing.availability !== 'available'}
              >
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

          {contactMethod === 'phone' && (
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
              </div>
            </div>
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