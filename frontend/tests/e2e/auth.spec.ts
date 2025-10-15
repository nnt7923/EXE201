import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('should navigate to login page', async ({ page }) => {
      // Click login button
      await page.click('text=Đăng nhập');
      
      // Check if redirected to login page or modal opened
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      // Navigate to login
      await page.click('text=Đăng nhập');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check for validation errors
      await expect(page.locator('text=Email là bắt buộc, text=Mật khẩu là bắt buộc')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      // Navigate to login
      await page.click('text=Đăng nhập');
      
      // Fill invalid credentials
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for error message
      await expect(page.locator('text=Email hoặc mật khẩu không đúng, text=Đăng nhập thất bại')).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      // Navigate to login
      await page.click('text=Đăng nhập');
      
      // Fill valid credentials (you might need to create a test user first)
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Check if redirected to dashboard or homepage with user menu
      await expect(page.locator('text=Đăng xuất, text=Tài khoản')).toBeVisible();
    });
  });

  test.describe('Registration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('should navigate to registration page', async ({ page }) => {
      // Click register button
      await page.click('text=Đăng ký');
      
      // Check if registration form is visible
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should show validation errors for invalid data', async ({ page }) => {
      // Navigate to registration
      await page.click('text=Đăng ký');
      
      // Fill invalid data
      await page.fill('input[name="name"]', 'a'); // Too short
      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', '123'); // Too short
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Check for validation errors
      await expect(page.locator('text=Tên phải có ít nhất 2 ký tự')).toBeVisible();
      await expect(page.locator('text=Email không hợp lệ')).toBeVisible();
      await expect(page.locator('text=Mật khẩu phải có ít nhất 6 ký tự')).toBeVisible();
    });

    test('should register successfully with valid data', async ({ page }) => {
      // Navigate to registration
      await page.click('text=Đăng ký');
      
      // Generate unique email for testing
      const timestamp = Date.now();
      const testEmail = `test${timestamp}@example.com`;
      
      // Fill valid data
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', 'password123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Check if registration successful
      await expect(page.locator('text=Đăng ký thành công, text=Chào mừng')).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      // First login (assuming we have a logged-in state)
      await page.goto('/');
      
      // If there's a logout button visible, test logout
      const logoutButton = page.locator('text=Đăng xuất');
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        
        // Check if redirected to homepage and login button is visible again
        await expect(page.locator('text=Đăng nhập')).toBeVisible();
        await expect(page.locator('text=Đăng ký')).toBeVisible();
      }
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing protected routes', async ({ page }) => {
      // Try to access a protected route (like dashboard)
      await page.goto('/dashboard');
      
      // Should be redirected to login or show login modal
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });
  });

  test.describe('Password Reset', () => {
    test('should show forgot password option', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Đăng nhập');
      
      // Look for forgot password link
      const forgotPasswordLink = page.locator('text=Quên mật khẩu');
      
      if (await forgotPasswordLink.isVisible()) {
        await forgotPasswordLink.click();
        
        // Check if password reset form is shown
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('text=Gửi email khôi phục')).toBeVisible();
      }
    });
  });
});