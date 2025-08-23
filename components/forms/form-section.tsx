'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  variant?: 'default' | 'card' | 'simple';
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function FormSection({
  title,
  description,
  children,
  variant = 'simple',
  className,
  icon: Icon
}: FormSectionProps) {
  const content = (
    <>
      {(title || description) && (
        <div className="space-y-2 mb-6">
          {title && (
            <div className="flex items-center space-x-2">
              {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
              <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            </div>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {variant === 'simple' && <Separator />}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
    </>
  );

  if (variant === 'card') {
    return (
      <Card className={cn("w-full", className)}>
        {(title || description) && (
          <CardHeader>
            <div className="flex items-center space-x-2">
              {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
              {title && <CardTitle>{title}</CardTitle>}
            </div>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {content}
    </div>
  );
}