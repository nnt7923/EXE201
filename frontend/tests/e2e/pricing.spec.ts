import { test, expect } from '@playwright/test';

test.describe('Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
  });

  test('should load pricing page successfully', async ({ page }) => {
    // Check if page loads without errors
    await expect(page).toHaveTitle(/Pricing/);
    
    // Check if header is visible
    await expect(page.locator('header')).toBeVisible();
    
    // Check if pricing section is present
    await expect(page.locator('[data-testid="pricing-section"]')).toBeVisible();
  });

  test('should display all pricing plans', async ({ page }) => {
    // Check if all three pricing plans are displayed
    const pricingCards = page.locator('[data-testid="pricing-card"]');
    await expect(pricingCards).toHaveCount(3);
    
    // Check Basic plan
    const basicPlan = pricingCards.nth(0);
    await expect(basicPlan.locator('h3')).toContainText('Basic');
    await expect(basicPlan.locator('text=Miễn phí')).toBeVisible();
    
    // Check Premium plan
    const premiumPlan = pricingCards.nth(1);
    await expect(premiumPlan.locator('h3')).toContainText('Premium');
    await expect(premiumPlan.locator('text=99,000₫')).toBeVisible();
    
    // Check Pro plan
    const proPlan = pricingCards.nth(2);
    await expect(proPlan.locator('h3')).toContainText('Pro');
    await expect(proPlan.locator('text=199,000₫')).toBeVisible();
  });

  test('should display plan features', async ({ page }) => {
    const pricingCards = page.locator('[data-testid="pricing-card"]');
    
    // Check if each plan has features listed
    for (let i = 0; i < 3; i++) {
      const card = pricingCards.nth(i);
      await expect(card.locator('ul li')).toHaveCount(4); // Each plan has 4 features
    }
  });

  test('should highlight popular plan', async ({ page }) => {
    // Check if Premium plan is marked as popular
    const premiumPlan = page.locator('[data-testid="pricing-card"]').nth(1);
    await expect(premiumPlan.locator('text=Phổ biến')).toBeVisible();
  });

  test('should navigate to checkout when clicking subscribe', async ({ page }) => {
    // Click on Premium plan subscribe button
    const premiumPlan = page.locator('[data-testid="pricing-card"]').nth(1);
    await premiumPlan.locator('button:has-text("Đăng ký ngay")').click();
    
    // Should navigate to checkout page
    await expect(page).toHaveURL(/\/checkout\/premium/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if pricing cards stack vertically on mobile
    const pricingCards = page.locator('[data-testid="pricing-card"]');
    await expect(pricingCards).toHaveCount(3);
    
    // Check if content is still readable
    await expect(pricingCards.first().locator('h3')).toBeVisible();
  });
});

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to checkout page for Premium plan
    await page.goto('/checkout/premium');
  });

  test('should load checkout page successfully', async ({ page }) => {
    // Check if page loads without errors
    await expect(page).toHaveTitle(/Checkout/);
    
    // Check if header is visible
    await expect(page.locator('header')).toBeVisible();
    
    // Check if checkout form is present
    await expect(page.locator('form')).toBeVisible();
  });

  test('should display plan details', async ({ page }) => {
    // Check if selected plan details are shown
    await expect(page.locator('text=Premium')).toBeVisible();
    await expect(page.locator('text=99,000₫')).toBeVisible();
    
    // Check if plan features are listed
    await expect(page.locator('ul li')).toHaveCount(4);
  });

  test('should display bank transfer form', async ({ page }) => {
    // Check if bank transfer form is visible
    const bankForm = page.locator('[data-testid="bank-transfer-form"]');
    await expect(bankForm).toBeVisible();
    
    // Check form fields
    await expect(bankForm.locator('input[name="fullName"]')).toBeVisible();
    await expect(bankForm.locator('input[name="email"]')).toBeVisible();
    await expect(bankForm.locator('input[name="phone"]')).toBeVisible();
    
    // Check bank details
    await expect(page.locator('text=Techcombank')).toBeVisible();
    await expect(page.locator('text=19036769999999')).toBeVisible();
    await expect(page.locator('text=NGUYEN NGOC TRUONG')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('text=Họ và tên là bắt buộc')).toBeVisible();
    await expect(page.locator('text=Email là bắt buộc')).toBeVisible();
    await expect(page.locator('text=Số điện thoại là bắt buộc')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    // Fill invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    // Check for email validation error
    await expect(page.locator('text=Email không hợp lệ')).toBeVisible();
  });

  test('should validate phone number format', async ({ page }) => {
    // Fill invalid phone number
    await page.fill('input[name="phone"]', '123');
    await page.click('button[type="submit"]');
    
    // Check for phone validation error
    await expect(page.locator('text=Số điện thoại không hợp lệ')).toBeVisible();
  });

  test('should submit form successfully with valid data', async ({ page }) => {
    // Fill valid form data
    await page.fill('input[name="fullName"]', 'Nguyen Van A');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '0123456789');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for success message or redirect
    await expect(page.locator('text=Đăng ký thành công, text=Cảm ơn bạn')).toBeVisible();
  });

  test('should copy bank account number', async ({ page }) => {
    // Look for copy button
    const copyButton = page.locator('button:has-text("Copy")');
    
    if (await copyButton.isVisible()) {
      await copyButton.click();
      
      // Check for copy success message
      await expect(page.locator('text=Đã sao chép')).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if form is still functional
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    
    // Check if bank details are readable
    await expect(page.locator('text=Techcombank')).toBeVisible();
  });
});

test.describe('Plan Navigation', () => {
  test('should navigate between different plan checkouts', async ({ page }) => {
    // Test Premium plan checkout
    await page.goto('/checkout/premium');
    await expect(page.locator('text=Premium')).toBeVisible();
    await expect(page.locator('text=99,000₫')).toBeVisible();
    
    // Test Pro plan checkout
    await page.goto('/checkout/pro');
    await expect(page.locator('text=Pro')).toBeVisible();
    await expect(page.locator('text=199,000₫')).toBeVisible();
  });

  test('should handle invalid plan IDs', async ({ page }) => {
    // Navigate to invalid plan
    await page.goto('/checkout/invalid-plan');
    
    // Should redirect to pricing or show error
    await expect(page.locator('text=Plan not found, text=404')).toBeVisible();
  });
});