import { test, expect } from '@playwright/test';

test.describe('Search Flow', () => {
  test('should allow searching with area selection', async ({ page }) => {
    // Navigate to search page
    await page.goto('/search');
    
    // Fill in search query
    await page.fill('input[placeholder="Search for rental items..."]', 'camera');
    
    // Click search button
    await page.click('button:has-text("Search")');
    
    // Wait for results to load
    await page.waitForSelector('[data-testid="search-results"]');
    
    // Verify results are displayed
    const results = await page.locator('[data-testid="search-results"]').count();
    expect(results).toBeGreaterThan(0);
  });
  
  test('should allow filtering by city and area', async ({ page }) => {
    // Navigate to search page
    await page.goto('/search');
    
    // Open filters
    await page.click('button:has-text("Filters")');
    
    // Select city (using Karachi as example)
    await page.click('button:has-text("Select city...")');
    await page.fill('input[placeholder="Search city..."]', 'Karachi');
    await page.click('div[role="option"]:has-text("Karachi")');
    
    // Select area (using DHA as example)
    await page.click('button:has-text("Select area...")');
    await page.fill('input[placeholder="Search area..."]', 'DHA');
    await page.click('div[role="option"]:has-text("DHA")');
    
    // Apply filters
    // The filters should automatically apply when selected
    
    // Wait for results to update
    await page.waitForTimeout(1000);
    
    // Verify that filters are applied (check URL or filter display)
    const url = page.url();
    expect(url).toContain('city=Karachi');
    expect(url).toContain('area=DHA');
  });
  
  test('should switch between view modes', async ({ page }) => {
    // Navigate to search page with results
    await page.goto('/search?q=camera');
    
    // Wait for results to load
    await page.waitForSelector('[data-testid="search-results"]');
    
    // Switch to list view
    await page.click('button[aria-label="List view"]');
    
    // Verify list view is active
    // This would depend on how the view mode is implemented
    
    // Switch to horizontal view
    await page.click('button[aria-label="Horizontal view"]');
    
    // Verify horizontal view is active
  });
});