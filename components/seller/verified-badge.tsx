'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function VerifiedBadge({ className, size = 'md' }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <Image
        src="/badges/verified.png"
        alt="Verified Seller"
        width={size === 'sm' ? 22 : size === 'md' ? 32 : 56}
        height={size === 'sm' ? 22 : size === 'md' ? 32 : 56}
        className={cn(sizeClasses[size], 'object-contain')}
      />
    </div>
  );
}