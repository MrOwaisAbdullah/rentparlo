'use client';

import React, { useState } from 'react';
import { Combobox } from '@/components/ui/combobox';

export default function ComboboxDemoPage() {
  const [selectedCity, setSelectedCity] = useState('');

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Combobox Demo</h1>
      <div className="max-w-md">
        <label className="block text-sm font-medium mb-2">Select a City</label>
        <Combobox
          value={selectedCity}
          onValueChange={setSelectedCity}
          placeholder="Select a city..."
          searchPlaceholder="Search for a city..."
          emptyMessage="No city found"
        />
        {selectedCity && (
          <p className="mt-4 text-sm text-muted-foreground">
            Selected city: {selectedCity}
          </p>
        )}
      </div>
    </div>
  );
}