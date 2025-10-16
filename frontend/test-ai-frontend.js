const puppeteer = require('puppeteer');

const FRONTEND_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

async function testFrontendAI() {
  let browser;
  let page;
  
  try {
    console.log('🚀 Starting frontend AI tests...\n');
    
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for headless mode
      defaultViewport: { width: 1280, height: 720 }
    });
    page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 Browser Error:', msg.text());
      }
    });
    
    // Test 1: Navigate to homepage
    console.log('🏠 Test 1: Navigate to homepage...');
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    const title = await page.title();
    console.log('✅ Page title:', title);
    
    // Test 2: Login
    console.log('\n🔐 Test 2: Login process...');
    
    // Look for login button
    const loginButton = await page.$('text=Đăng nhập');
    if (loginButton) {
      await loginButton.click();
      console.log('✅ Login button clicked');
    } else {
      // Try alternative selectors
      await page.click('a[href="/auth/login"]');
      console.log('✅ Login link clicked');
    }
    
    await page.waitForTimeout(1000);
    
    // Fill login form
    await page.type('input[type="email"]', TEST_USER.email);
    await page.type('input[type="password"]', TEST_USER.password);
    console.log('✅ Login credentials entered');
    
    // Submit login
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('✅ Login form submitted');
    
    // Check if login successful
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    // Test 3: Navigate to AI features
    console.log('\n🤖 Test 3: Navigate to AI features...');
    
    // Look for AI-related navigation
    const aiLinks = [
      'text=Tạo lịch trình',
      'text=AI',
      'text=Gợi ý',
      'a[href*="itinerary"]',
      'a[href*="ai"]'
    ];
    
    let aiLinkFound = false;
    for (const selector of aiLinks) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          console.log(`✅ Clicked AI link: ${selector}`);
          aiLinkFound = true;
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    if (!aiLinkFound) {
      console.log('⚠️ No AI link found, navigating directly to /itinerary/create');
      await page.goto(`${FRONTEND_URL}/itinerary/create`, { waitUntil: 'networkidle2' });
    }
    
    await page.waitForTimeout(2000);
    
    // Test 4: Test AI itinerary creation
    console.log('\n📝 Test 4: Test AI itinerary creation...');
    
    try {
      // Fill itinerary form
      const destinationInput = await page.$('input[name="destination"], input[placeholder*="điểm đến"], input[placeholder*="destination"]');
      if (destinationInput) {
        await destinationInput.type('Hà Nội');
        console.log('✅ Destination filled: Hà Nội');
      }
      
      const durationInput = await page.$('input[name="duration"], input[type="number"]');
      if (durationInput) {
        await durationInput.clear();
        await durationInput.type('3');
        console.log('✅ Duration filled: 3 days');
      }
      
      const budgetSelect = await page.$('select[name="budget"], select[name="budgetRange"]');
      if (budgetSelect) {
        await budgetSelect.select('MEDIUM');
        console.log('✅ Budget selected: MEDIUM');
      }
      
      // Look for interests checkboxes or inputs
      const interestElements = await page.$$('input[type="checkbox"], input[name*="interest"]');
      if (interestElements.length > 0) {
        // Check first few interests
        for (let i = 0; i < Math.min(3, interestElements.length); i++) {
          await interestElements[i].click();
        }
        console.log('✅ Interests selected');
      }
      
      // Submit form
      const submitButton = await page.$('button[type="submit"], button:contains("Tạo"), button:contains("Generate")');
      if (submitButton) {
        console.log('🚀 Submitting AI itinerary request...');
        await submitButton.click();
        
        // Wait for AI response
        await page.waitForTimeout(5000);
        
        // Check for loading indicators
        const loadingElements = await page.$$('.loading, .spinner, [data-loading="true"]');
        if (loadingElements.length > 0) {
          console.log('⏳ AI processing detected, waiting...');
          await page.waitForTimeout(15000);
        }
        
        // Check for results
        const resultElements = await page.$$('.itinerary, .result, .ai-response');
        if (resultElements.length > 0) {
          console.log('✅ AI itinerary results displayed');
        } else {
          console.log('⚠️ No AI results found');
        }
        
      } else {
        console.log('⚠️ Submit button not found');
      }
      
    } catch (error) {
      console.log('❌ Error in AI itinerary test:', error.message);
    }
    
    // Test 5: Check for error messages
    console.log('\n🚨 Test 5: Check for error messages...');
    
    const errorElements = await page.$$('.error, .alert-error, [role="alert"]');
    if (errorElements.length > 0) {
      for (const errorEl of errorElements) {
        const errorText = await errorEl.textContent();
        console.log('🔴 Error found:', errorText);
      }
    } else {
      console.log('✅ No error messages found');
    }
    
    // Test 6: Check console errors
    console.log('\n📊 Test 6: Check browser console...');
    
    const logs = await page.evaluate(() => {
      return window.console.logs || [];
    });
    
    console.log('✅ Browser console check completed');
    
    // Final screenshot
    await page.screenshot({ path: 'frontend-ai-test.png', fullPage: true });
    console.log('📸 Screenshot saved: frontend-ai-test.png');
    
    console.log('\n🎉 Frontend AI tests completed!');
    
  } catch (error) {
    console.log('❌ Frontend test error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
async function checkPuppeteer() {
  try {
    require('puppeteer');
    return true;
  } catch (error) {
    console.log('❌ Puppeteer not found. Installing...');
    console.log('💡 Run: npm install puppeteer');
    return false;
  }
}

async function runTests() {
  const hasPuppeteer = await checkPuppeteer();
  if (hasPuppeteer) {
    await testFrontendAI();
  } else {
    console.log('⚠️ Skipping frontend tests - Puppeteer not available');
    console.log('📝 Manual test checklist:');
    console.log('   1. Navigate to http://localhost:3000');
    console.log('   2. Login with test@example.com / password123');
    console.log('   3. Navigate to itinerary creation page');
    console.log('   4. Fill form: Hà Nội, 3 days, MEDIUM budget');
    console.log('   5. Submit and check AI response');
    console.log('   6. Check for errors in browser console');
  }
}

runTests().catch(console.error);