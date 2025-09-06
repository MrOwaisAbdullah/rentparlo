'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

interface SafetyNoticeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionType: 'whatsapp' | 'call' | 'map';
  sellerName?: string;
}

export function SafetyNoticeModal({ 
  open, 
  onClose, 
  onConfirm, 
  actionType,
  sellerName = 'this seller'
}: SafetyNoticeModalProps) {
  const getTitle = () => {
    switch (actionType) {
      case 'whatsapp':
        return 'Safety Reminder - WhatsApp Contact';
      case 'call':
        return 'Safety Reminder - Phone Call';
      case 'map':
        return 'Safety Reminder - Map Location';
      default:
        return 'Safety Reminder';
    }
  };

  const getMessage = () => {
    switch (actionType) {
      case 'whatsapp':
        return `You are about to contact ${sellerName} via WhatsApp. Please follow these safety guidelines:`;
      case 'call':
        return `You are about to call ${sellerName}. Please follow these safety guidelines:`;
      case 'map':
        return `You are about to view the map location for ${sellerName}'s item. Please follow these safety guidelines:`;
      default:
        return `Please follow these safety guidelines:`;
    }
  };

  const safetyTips = [
    "Meet in a public place for the first time",
    "Inform a friend or family member about your meeting",
    "Inspect the item thoroughly before making any payment",
    "Don't pay in advance without inspecting the item",
    "Trust your instincts - if something feels off, cancel the meeting",
    "Verify the item details and condition before finalizing any agreement"
  ];

  const safetyTipsUrdu = [
    "پہلی بار ملاقات کے لیے عوامی جگہ پر ملاقات کریں",
    "اپنے دوست یا خاندان کے فرد کو اپنی ملاقات کے بارے میں آگاہ کریں",
    "ادائیگی کرنے سے پہلے آئٹم کا تعائن کریں",
    "آئٹم کا تعائن کیے بغیر پیشگی ادائیگی نہ کریں",
    "اپنی بےچینی پر عمل کریں - اگر کچھ غلط محسوس ہوتا ہے تو ملاقات منسوخ کر دیں",
    "آخری معاہدے سے پہلے آئٹم کی تفصیلات اور حالت کی تصدیق کریں"
  ];

  const getActionText = () => {
    switch (actionType) {
      case 'whatsapp':
        return 'Continue to WhatsApp';
      case 'call':
        return 'Make Call';
      case 'map':
        return 'View Location';
      default:
        return 'Continue';
    }
  };

  const getActionButtonClass = () => {
    switch (actionType) {
      case 'whatsapp':
        return 'bg-green-600 hover:bg-green-700';
      case 'call':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'map':
        return 'bg-purple-600 hover:bg-purple-700';
      default:
        return 'bg-primary hover:bg-primary/90';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{getMessage()}</p>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 text-center">Safety Tips / حفاظتی ہدایات</h4>
              <div className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {safetyTips.map((tip, index) => (
                    <li key={`en-${index}`} className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-2 text-sm text-muted-foreground mt-4">
                  {safetyTipsUrdu.map((tip, index) => (
                    <li key={`ur-${index}`} className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span className="text-right flex-1">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onConfirm} 
              className={getActionButtonClass()}
            >
              {getActionText()}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}