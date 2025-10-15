import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check if page loads without errors
    await expect(page).toHaveTitle(/An Gi Ở Đâu/);
    
    // Check if header is visible
    await expect(page.locator('header')).toBeVisible();
    
    // Check if main sections are present
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="featured-places"]')).toBeVisible();
    await expect(page.locator('[data-testid="map-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="community-section"]')).toBeVisible();
    
    // Check if footer is visible
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    // Check navigation links
    await expect(page.locator('nav a[href="/"]')).toBeVisible();
    await expect(page.locator('nav a[href="/pricing"]')).toBeVisible();
    
    // Check if login/signup buttons are present
    await expect(page.locator('text=Đăng nhập')).toBeVisible();
    await expect(page.locator('text=Đăng ký')).toBeVisible();
  });

  test('should display hero section content', async ({ page }) => {
    const heroSection = page.locator('[data-testid="hero-section"]');
    
    // Check hero title
    await expect(heroSection.locator('h1')).toContainText('An Gi Ở Đâu');
    
    // Check hero description
    await expect(heroSection.locator('p')).toBeVisible();
    
    // Check CTA buttons
    await expect(heroSection.locator('button, a').first()).toBeVisible();
  });

  test('should display pricing section', async ({ page }) => {
    const pricingSection = page.locator('[data-testid="pricing-section"]');
    
    // Check pricing title
    await expect(pricingSection.locator('h2')).toBeVisible();
    
    // Check if pricing cards are displayed
    await expect(pricingSection.locator('[data-testid="pricing-card"]')).toHaveCount(3);
  });

  test('should display featured places', async ({ page }) => {
    const featuredSection = page.locator('[data-testid="featured-places"]');
    
    // Wait for places to load
    await page.waitForTimeout(2000);
    
    // Check if places are displayed
    const placeCards = featuredSection.locator('[data-testid="place-card"]');
    await expect(placeCards.first()).toBeVisible();
  });

  test('should display interactive map', async ({ page }) => {
    const mapSection = page.locator('[data-testid="map-section"]');
    
    // Check if map container is present
    await expect(mapSection).toBeVisible();
    
    // Wait for map to load
    await page.waitForTimeout(3000);
    
    // Check if leaflet map is initialized
    await expect(mapSection.locator('.leaflet-container')).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    
    if (await searchInput.isVisible()) {
      // Test search input
      await searchInput.fill('Hà Nội');
      await searchInput.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(2000);
      
      // Check if search affects the display
      // This depends on your search implementation
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if page is still functional
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    
    // Check if mobile menu works (if implemented)
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    }
  });

  test('should handle my location functionality', async ({ page }) => {
    // Mock geolocation
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 21.0285, longitude: 105.8542 });
    
    // Look for "My Location" button
    const myLocationButton = page.locator('button:has-text("Vị trí của tôi"), button[title*="location"]');
    
    if (await myLocationButton.isVisible()) {
      await myLocationButton.click();
      
      // Wait for map to update
      await page.waitForTimeout(2000);
      
      // Check if map center changed (this depends on your implementation)
    }
  });
});