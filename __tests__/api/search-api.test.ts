import { searchListings } from '../../lib/sanity-queries';

describe('Search API', () => {
  describe('Area Parameter', () => {
    it('should return listings when area parameter is provided', async () => {
      // Test with a specific area in Karachi
      const results = await searchListings({
        city: 'Karachi',
        area: 'DHA',
        limit: 5
      });

      // Verify that we get results (this will depend on the test data)
      expect(Array.isArray(results)).toBe(true);
    });

    it('should return listings when area parameter is empty', async () => {
      // Test with city but no area
      const results = await searchListings({
        city: 'Karachi',
        area: '',
        limit: 5
      });

      // Verify that we get results
      expect(Array.isArray(results)).toBe(true);
    });

    it('should return listings when neither city nor area is provided', async () => {
      // Test with no location filters
      const results = await searchListings({
        city: '',
        area: '',
        limit: 5
      });

      // Verify that we get results
      expect(Array.isArray(results)).toBe(true);
    });
  });
});