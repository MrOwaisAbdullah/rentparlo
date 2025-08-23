'use client';

import React from 'react';
import { User, Store, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface RoleSelectorProps {
  selected: 'user' | 'seller' | null;
  onSelect: (role: 'user' | 'seller') => void;
  className?: string;
}

const roleOptions = [
  {
    value: 'user' as const,
    title: 'I want to rent items',
    description: 'Browse and rent from verified sellers across Pakistan',
    icon: User,
    features: [
      'Access to all listings',
      'Direct contact with sellers',
      'Saved favorites',
      'Review and rating system'
    ],
    color: 'blue'
  },
  {
    value: 'seller' as const,
    title: 'I want to rent out items',
    description: 'List your items and earn money by renting them out',
    icon: Store,
    features: [
      'Create listings',
      'Analytics dashboard',
      'Seller verification badge',
      'Priority customer support'
    ],
    color: 'green'
  }
];

export function RoleSelector({ selected, onSelect, className }: RoleSelectorProps) {
  return (
    <div className={cn("space-y-4", className)}>
      
      <div className="grid gap-4 md:grid-cols-2">
        {roleOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selected === option.value;
          
          return (
            <Card
              key={option.value}
              className={cn(
                "relative cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected && "ring-2 ring-primary border-primary bg-primary/5"
              )}
              onClick={() => onSelect(option.value)}
            >
              <CardContent className="p-6">
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
                
                {/* Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                  option.color === 'blue' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                
                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-base mb-1">
                      {option.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                  
                  {/* Features */}
                  <ul className="space-y-1">
                    {option.features.map((feature, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-center">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full mr-2",
                          option.color === 'blue' ? "bg-blue-400" : "bg-green-400"
                        )} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Conversion message */}
      {selected && (
        <div className="text-center mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {selected === 'user' 
              ? "You can always become a seller later by upgrading your account."
              : "Your seller account will be reviewed and verified within 24-48 hours."
            }
          </p>
        </div>
      )}
    </div>
  );
}

export default RoleSelector;