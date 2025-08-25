'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CityAreaCombobox } from '@/components/ui/combobox';

const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta"
];

export default function TestComboboxPage() {
  const [city, setCity] = useState('Karachi');
  const [area, setArea] = useState('');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Test Combobox Component</h1>
      
      <div className="max-w-md mx-auto space-y-4">
        <CityAreaCombobox
          cities={PAKISTAN_CITIES}
          selectedCity={city}
          selectedArea={area}
          onCityChange={setCity}
          onAreaChange={setArea}
        />
        
        <div className="p-4 bg-gray-100 rounded-md">
          <p>Selected City: {city || 'None'}</p>
          <p>Selected Area: {area || 'None'}</p>
        </div>
      </div>
    </div>
  );
}