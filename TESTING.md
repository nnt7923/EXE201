# Testing Documentation - An Gi Ở Đâu Platform

## 📋 Tổng quan

Dự án An Gi Ở Đâu Platform sử dụng một chiến lược testing toàn diện bao gồm:

- **Unit Tests**: Kiểm tra các function và component riêng lẻ
- **Integration Tests**: Kiểm tra tương tác giữa các module và database
- **System Tests**: Kiểm tra toàn bộ API endpoints
- **End-to-End Tests**: Kiểm tra user journey hoàn chỉnh

## 🏗️ Cấu trúc Testing

```
├── api/
│   ├── tests/
│   │   ├── setup.js              # Jest setup cho backend
│   │   ├── system.test.js        # System tests cho API
│   │   ├── integration.test.js   # Integration tests cho database
│   │   ├── auth.test.js          # Authentication tests
│   │   ├── places.test.js        # Places API tests
│   │   └── ai.test.js            # AI service tests
│   └── jest.config.js            # Jest configuration
├── frontend/
│   ├── tests/
│   │   └── e2e/
│   │       ├── homepage.spec.ts  # Homepage E2E tests
│   │       ├── auth.spec.ts      # Authentication E2E tests
│   │       ├── pricing.spec.ts   # Pricing & checkout E2E tests
│   │       └── places.spec.ts    # Places & map E2E tests
│   └── playwright.config.ts     # Playwright configuration
├── scripts/
│   ├── test-setup.js            # Test environment setup
│   └── run-all-tests.js         # Run complete test suite
├── .env.test                    # Test environment variables
└── docker-compose.test.yml     # Docker test environment
```

## 🚀 Quick Start

### 1. Setup Test Environment

```bash
# Cài đặt dependencies và setup test environment
npm run test:setup
```

### 2. Chạy All Tests

```bash
# Chạy toàn bộ test suite (backend + frontend)
npm test

# Hoặc chạy từng loại test riêng biệt
npm run test:backend    # Backend tests only
npm run test:frontend   # Frontend E2E tests only
```

## 🔧 Backend Testing

### Technologies
- **Jest**: Test framework
- **Supertest**: HTTP testing
- **MongoDB Memory Server**: In-memory database for testing

### Available Commands

```bash
cd api

# Chạy tất cả tests
npm test

# Chạy tests với coverage
npm run test:coverage

# Chạy system tests
npm run test:system

# Chạy integration tests
npm run test:integration

# Chạy unit tests
npm run test:unit

# Watch mode
npm run test:watch
```

### Test Categories

#### 1. System Tests (`system.test.js`)
Kiểm tra tất cả API endpoints:
- Health check
- Authentication (register, login, logout)
- Places CRUD operations
- Reviews management
- Itineraries
- Subscription plans
- User management (admin)
- Categories
- Error handling

#### 2. Integration Tests (`integration.test.js`)
Kiểm tra database operations:
- Model validations
- Database relationships
- Data persistence
- Query operations

#### 3. Unit Tests
Kiểm tra individual functions:
- Authentication middleware
- Validation functions
- Utility functions
- AI service functions

### Test Data

Tests sử dụng:
- Test database: `angioddau_test`
- Mock data cho places, users, reviews
- Test JWT tokens
- Mock external API calls (OpenAI, Google AI)

## 🎭 Frontend Testing

### Technologies
- **Playwright**: E2E testing framework
- **TypeScript**: Type safety cho tests

### Available Commands

```bash
cd frontend

# Chạy E2E tests
npm test

# Chạy với UI mode
npm run test:ui

# Chạy với browser visible
npm run test:headed

# Debug mode
npm run test:debug

# Xem test report
npm run test:report
```

### Test Categories

#### 1. Homepage Tests (`homepage.spec.ts`)
- Page loading và navigation
- Hero section display
- Pricing section
- Featured places
- Interactive map
- Search functionality
- Responsive design
- My location feature

#### 2. Authentication Tests (`auth.spec.ts`)
- Login flow
- Registration flow
- Form validation
- Error handling
- Logout functionality
- Protected routes
- Password reset

#### 3. Pricing & Checkout Tests (`pricing.spec.ts`)
- Pricing page display
- Plan comparison
- Checkout flow
- Form validation
- Payment information
- Responsive design

#### 4. Places & Map Tests (`places.spec.ts`)
- Places display
- Map interaction
- Marker clicks
- Search functionality
- Category filtering
- Place details modal
- Mobile interactions

### Browser Support

Tests chạy trên:
- Chromium (Desktop)
- Firefox (Desktop)
- WebKit/Safari (Desktop)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## 🐳 Docker Testing

Chạy tests trong Docker environment:

```bash
# Chạy complete test suite trong Docker
npm run test:docker
```

Docker test environment bao gồm:
- MongoDB test instance
- API server với test configuration
- Frontend với test build
- Isolated network

## 📊 Test Coverage

### Backend Coverage Goals
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Coverage Reports
- Backend: `api/coverage/`
- Frontend: `frontend/test-results/`

## 🔍 Test Data & Mocking

### Backend Mocking
- External API calls (OpenAI, Google AI, Cloudinary)
- Email services
- File uploads
- Payment processing

### Frontend Mocking
- API responses
- Geolocation
- File uploads
- External services

### Test Data
- Predefined users với different roles
- Sample places data
- Mock reviews và ratings
- Test subscription plans

## 🚨 Continuous Integration

### GitHub Actions (Recommended)

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm run test:setup
      - run: npm test
```

### Pre-commit Hooks

```bash
# Cài đặt pre-commit hooks
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run test:backend"
```

## 🐛 Debugging Tests

### Backend Debugging
```bash
# Debug specific test
npm test -- --testNamePattern="should login user"

# Debug với verbose output
npm test -- --verbose

# Debug với watch mode
npm run test:watch
```

### Frontend Debugging
```bash
# Debug mode với browser
npm run test:debug

# Chạy specific test file
npx playwright test homepage.spec.ts

# Headed mode để xem browser
npm run test:headed
```

## 📝 Writing New Tests

### Backend Test Example

```javascript
describe('Places API', () => {
  test('should create new place', async () => {
    const placeData = {
      name: 'Test Place',
      description: 'Test Description',
      location: { lat: 21.0285, lng: 105.8542 }
    };
    
    const response = await request(app)
      .post('/api/places')
      .set('Authorization', `Bearer ${authToken}`)
      .send(placeData)
      .expect(201);
      
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(placeData.name);
  });
});
```

### Frontend Test Example

```typescript
test('should display place details', async ({ page }) => {
  await page.goto('/');
  
  // Wait for places to load
  await page.waitForSelector('[data-testid="place-card"]');
  
  // Click on first place
  await page.click('[data-testid="place-card"]:first-child');
  
  // Check if details modal opens
  await expect(page.locator('[data-testid="place-modal"]')).toBeVisible();
});
```

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Đảm bảo MongoDB đang chạy
   mongod --dbpath /path/to/your/db
   ```

2. **Port Already in Use**
   ```bash
   # Kill processes sử dụng port
   npx kill-port 3000 5000
   ```

3. **Playwright Browser Issues**
   ```bash
   # Reinstall browsers
   npx playwright install
   ```

4. **Test Timeout**
   - Tăng timeout trong configuration
   - Kiểm tra network connectivity
   - Optimize test data

### Performance Tips

1. **Parallel Testing**: Sử dụng `--workers` flag
2. **Test Isolation**: Cleanup data sau mỗi test
3. **Mock External Services**: Tránh real API calls
4. **Optimize Selectors**: Sử dụng data-testid attributes

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

## 🤝 Contributing

Khi thêm features mới:

1. Viết tests trước (TDD approach)
2. Đảm bảo coverage không giảm
3. Update documentation nếu cần
4. Chạy full test suite trước khi commit

```bash
# Checklist trước khi commit
npm run test:backend
npm run test:frontend
npm run build
```