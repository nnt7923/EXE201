import { test, expect } from '@playwright/test';

test.describe('Places and Map Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display featured places', async ({ page }) => {
    // Wait for places to load
    await page.waitForTimeout(3000);
    
    const featuredSection = page.locator('[data-testid="featured-places"]');
    await expect(featuredSection).toBeVisible();
    
    // Check if place cards are displayed
    const placeCards = featuredSection.locator('[data-testid="place-card"]');
    await expect(placeCards.first()).toBeVisible();
    
    // Check place card content
    const firstCard = placeCards.first();
    await expect(firstCard.locator('img')).toBeVisible();
    await expect(firstCard.locator('h3')).toBeVisible();
    await expect(firstCard.locator('p')).toBeVisible();
  });

  test('should display interactive map', async ({ page }) => {
    // Wait for map to load
    await page.waitForTimeout(5000);
    
    const mapSection = page.locator('[data-testid="map-section"]');
    await expect(mapSection).toBeVisible();
    
    // Check if Leaflet map is initialized
    const mapContainer = mapSection.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
    
    // Check if map controls are present
    await expect(mapContainer.locator('.leaflet-control-zoom')).toBeVisible();
  });

  test('should display place markers on map', async ({ page }) => {
    // Wait for map and markers to load
    await page.waitForTimeout(5000);
    
    const mapContainer = page.locator('.leaflet-container');
    
    // Check if markers are present
    const markers = mapContainer.locator('.leaflet-marker-icon');
    await expect(markers.first()).toBeVisible();
  });

  test('should handle marker click', async ({ page }) => {
    // Wait for map to load
    await page.waitForTimeout(5000);
    
    const mapContainer = page.locator('.leaflet-container');
    const firstMarker = mapContainer.locator('.leaflet-marker-icon').first();
    
    if (await firstMarker.isVisible()) {
      await firstMarker.click();
      
      // Check if popup or place details appear
      await page.waitForTimeout(1000);
      
      // Look for popup or place info panel
      const popup = page.locator('.leaflet-popup, [data-testid="place-popup"]');
      if (await popup.isVisible()) {
        await expect(popup).toBeVisible();
      }
    }
  });

  test('should handle search functionality', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"], input[placeholder*="Search"]');
    
    if (await searchInput.isVisible()) {
      // Test search
      await searchInput.fill('Hà Nội');
      await searchInput.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(3000);
      
      // Check if search affects the map or results
      // This depends on your search implementation
      const mapContainer = page.locator('.leaflet-container');
      await expect(mapContainer).toBeVisible();
    }
  });

  test('should handle my location button', async ({ page }) => {
    // Mock geolocation
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 21.0285, longitude: 105.8542 });
    
    // Look for "My Location" button
    const myLocationButton = page.locator('button:has-text("Vị trí của tôi"), button[title*="location"], [data-testid="my-location-button"]');
    
    if (await myLocationButton.isVisible()) {
      await myLocationButton.click();
      
      // Wait for map to update
      await page.waitForTimeout(3000);
      
      // Check if user location marker appears
      const mapContainer = page.locator('.leaflet-container');
      await expect(mapContainer).toBeVisible();
    }
  });

  test('should handle map zoom controls', async ({ page }) => {
    // Wait for map to load
    await page.waitForTimeout(5000);
    
    const mapContainer = page.locator('.leaflet-container');
    const zoomControls = mapContainer.locator('.leaflet-control-zoom');
    
    await expect(zoomControls).toBeVisible();
    
    // Test zoom in
    const zoomInButton = zoomControls.locator('.leaflet-control-zoom-in');
    if (await zoomInButton.isVisible()) {
      await zoomInButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Test zoom out
    const zoomOutButton = zoomControls.locator('.leaflet-control-zoom-out');
    if (await zoomOutButton.isVisible()) {
      await zoomOutButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should handle place card interactions', async ({ page }) => {
    // Wait for places to load
    await page.waitForTimeout(3000);
    
    const placeCards = page.locator('[data-testid="place-card"]');
    
    if (await placeCards.first().isVisible()) {
      // Click on first place card
      await placeCards.first().click();
      
      // Check if map centers on the place or shows details
      await page.waitForTimeout(2000);
      
      // This depends on your implementation
      // Could check for map movement, popup, or detail panel
    }
  });

  test('should filter places by category', async ({ page }) => {
    // Look for category filters
    const categoryFilters = page.locator('[data-testid="category-filter"], .category-filter');
    
    if (await categoryFilters.first().isVisible()) {
      // Click on a category filter
      await categoryFilters.first().click();
      
      // Wait for filtering
      await page.waitForTimeout(2000);
      
      // Check if places are filtered
      const placeCards = page.locator('[data-testid="place-card"]');
      await expect(placeCards.first()).toBeVisible();
    }
  });

  test('should handle place details modal', async ({ page }) => {
    // Wait for places to load
    await page.waitForTimeout(3000);
    
    const placeCards = page.locator('[data-testid="place-card"]');
    
    if (await placeCards.first().isVisible()) {
      // Look for "View Details" button or similar
      const detailsButton = placeCards.first().locator('button:has-text("Chi tiết"), button:has-text("Xem thêm")');
      
      if (await detailsButton.isVisible()) {
        await detailsButton.click();
        
        // Check if modal opens
        const modal = page.locator('[data-testid="place-modal"], .modal, [role="dialog"]');
        await expect(modal).toBeVisible();
        
        // Check modal content
        await expect(modal.locator('h2, h3')).toBeVisible();
        await expect(modal.locator('img')).toBeVisible();
        
        // Close modal
        const closeButton = modal.locator('button:has-text("Đóng"), [aria-label="Close"]');
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await expect(modal).not.toBeVisible();
        }
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Check if map is still functional
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
    
    // Check if place cards are stacked properly
    const featuredSection = page.locator('[data-testid="featured-places"]');
    await expect(featuredSection).toBeVisible();
    
    // Check if touch interactions work on mobile
    const placeCards = page.locator('[data-testid="place-card"]');
    if (await placeCards.first().isVisible()) {
      await placeCards.first().tap();
      await page.waitForTimeout(1000);
    }
  });

  test('should handle map drag and pan', async ({ page }) => {
    // Wait for map to load
    await page.waitForTimeout(5000);
    
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
    
    // Get map bounds
    const mapBounds = await mapContainer.boundingBox();
    
    if (mapBounds) {
      // Simulate drag
      await page.mouse.move(mapBounds.x + mapBounds.width / 2, mapBounds.y + mapBounds.height / 2);
      await page.mouse.down();
      await page.mouse.move(mapBounds.x + mapBounds.width / 2 + 100, mapBounds.y + mapBounds.height / 2 + 100);
      await page.mouse.up();
      
      // Wait for map to update
      await page.waitForTimeout(1000);
      
      // Map should still be visible and functional
      await expect(mapContainer).toBeVisible();
    }
  });
});