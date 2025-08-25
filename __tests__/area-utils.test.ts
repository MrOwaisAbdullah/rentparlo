import { getAreasForCity, hasAreas, getCitiesWithAreas, getAllAreas } from '../lib/area-utils';

describe('Area Utilities', () => {
  describe('getAreasForCity', () => {
    it('should return areas for a valid city', () => {
      const areas = getAreasForCity('Karachi');
      expect(areas).toEqual(['DHA', 'Clifton', 'Gulshan', 'North Nazimabad', 'Defence', 'Saddar']);
    });

    it('should return empty array for an invalid city', () => {
      const areas = getAreasForCity('InvalidCity');
      expect(areas).toEqual([]);
    });
  });

  describe('hasAreas', () => {
    it('should return true for a city with defined areas', () => {
      const result = hasAreas('Karachi');
      expect(result).toBe(true);
    });

    it('should return false for a city without defined areas', () => {
      const result = hasAreas('InvalidCity');
      expect(result).toBe(false);
    });
  });

  describe('getCitiesWithAreas', () => {
    it('should return all cities with defined areas', () => {
      const cities = getCitiesWithAreas();
      expect(cities).toContain('Karachi');
      expect(cities).toContain('Lahore');
      expect(cities).toContain('Islamabad');
    });
  });

  describe('getAllAreas', () => {
    it('should return all unique areas across all cities', () => {
      const areas = getAllAreas();
      expect(areas).toContain('DHA');
      expect(areas).toContain('Clifton');
      expect(areas).toContain('Gulberg');
    });
  });
});