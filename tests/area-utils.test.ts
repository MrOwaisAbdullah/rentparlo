import { describe, it, expect } from 'vitest';
import { getAreasForCity, hasAreas } from '../lib/area-utils';

describe('Area Utilities', () => {
  it('should return areas for a city that has defined areas', () => {
    const areas = getAreasForCity('Karachi');
    expect(areas).toEqual(['DHA', 'Clifton', 'Gulshan', 'North Nazimabad', 'Defence', 'Saddar']);
  });

  it('should return empty array for a city that has no defined areas', () => {
    const areas = getAreasForCity('SomeUnknownCity');
    expect(areas).toEqual([]);
  });

  it('should return empty array for an empty city name', () => {
    const areas = getAreasForCity('');
    expect(areas).toEqual([]);
  });

  it('should correctly identify if a city has areas defined', () => {
    expect(hasAreas('Karachi')).toBe(true);
    expect(hasAreas('Lahore')).toBe(true);
    expect(hasAreas('Islamabad')).toBe(true);
    expect(hasAreas('SomeUnknownCity')).toBe(false);
    expect(hasAreas('')).toBe(false);
  });
});