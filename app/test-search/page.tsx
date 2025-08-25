'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function TestSearchPage() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Karachi');
  const [area, setArea] = useState('');

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    if (query) {
      searchParams.set('q', query);
    }
    
    if (city) {
      searchParams.set('city', city);
    }
    
    if (area) {
      searchParams.set('area', area);
    }
    
    window.location.href = `/search?${searchParams.toString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Test Search Functionality</h1>
      
      <div className="max-w-md mx-auto space-y-4">
        <Input
          placeholder="Search query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        
        <CityAreaCombobox
          cities={PAKISTAN_CITIES}
          selectedCity={city}
          selectedArea={area}
          onCityChange={setCity}
          onAreaChange={setArea}
        />
        
        <Button onClick={handleSearch}>Search</Button>
      </div>
    </div>
  );
}