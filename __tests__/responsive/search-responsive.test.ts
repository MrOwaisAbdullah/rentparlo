import { test, expect } from '@playwright/test';

test.describe('Search Page Responsive Design', () => {
  test('should display filters in sidebar on desktop', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Navigate to search page
    await page.goto('/search');
    
    // Check that filters sidebar is visible
    const filtersSidebar = await page.locator('[data-testid="filters-sidebar"]');
    await expect(filtersSidebar).toBeVisible();
  });
  
  test('should display filters in modal on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to search page
    await page.goto('/search');
    
    // Check that filters button is visible
    const filtersButton = await page.locator('button:has-text("Filters")');
    await expect(filtersButton).toBeVisible();
    
    // Check that filters sidebar is not visible initially
    const filtersSidebar = await page.locator('[data-testid="filters-sidebar"]');
    await expect(filtersSidebar).not.toBeVisible();
    
    // Click filters button
    await filtersButton.click();
    
    // Check that filters modal is visible
    const filtersModal = await page.locator('[data-testid="filters-modal"]');
    await expect(filtersModal).toBeVisible();
  });
  
  test('should display grid view by default on all devices', async ({ page }) => {
    // Test on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/search?q=camera');
    let gridView = await page.locator('[data-testid="grid-view"]');
    await expect(gridView).toBeVisible();
    
    // Test on tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    gridView = await page.locator('[data-testid="grid-view"]');
    await expect(gridView).toBeVisible();
    
    // Test on desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    gridView = await page.locator('[data-testid="grid-view"]');
    await expect(gridView).toBeVisible();
  });
  
  test('should allow switching to list view on all devices', async ({ page }) => {
    // Test on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/search?q=camera');
    
    // Switch to list view
    const listViewButton = await page.locator('button[aria-label="List view"]');
    await listViewButton.click();
    
    // Check that list view is active
    const listView = await page.locator('[data-testid="list-view"]');
    await expect(listView).toBeVisible();
  });
});