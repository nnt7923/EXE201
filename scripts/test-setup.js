#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up test environment...');

// Check if .env.test exists
const envTestPath = path.join(__dirname, '..', '.env.test');
if (!fs.existsSync(envTestPath)) {
  console.error('❌ .env.test file not found. Please create it first.');
  process.exit(1);
}

// Function to run command and handle errors
function runCommand(command, description) {
  try {
    console.log(`📦 ${description}...`);
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Install dependencies
runCommand('npm install', 'Installing root dependencies');
runCommand('cd api && npm install', 'Installing API dependencies');
runCommand('cd frontend && npm install', 'Installing frontend dependencies');

// Setup test database
console.log('🗄️ Setting up test database...');
try {
  // Check if MongoDB is running
  execSync('mongosh --eval "db.runCommand({ ping: 1 })"', { stdio: 'pipe' });
  console.log('✅ MongoDB is running');
  
  // Create test database
  execSync('mongosh angioddau_test --eval "db.createCollection(\'test\')"', { stdio: 'pipe' });
  console.log('✅ Test database created');
} catch (error) {
  console.warn('⚠️ MongoDB setup failed. Make sure MongoDB is running.');
  console.warn('You can start MongoDB with: mongod --dbpath /path/to/your/db');
}

// Run backend tests to ensure setup is correct
console.log('🧪 Running backend test suite...');
try {
  execSync('cd api && npm test', { stdio: 'inherit' });
  console.log('✅ Backend tests passed');
} catch (error) {
  console.warn('⚠️ Some backend tests failed. Check the output above.');
}

// Install Playwright browsers
console.log('🎭 Installing Playwright browsers...');
try {
  execSync('cd frontend && npx playwright install', { stdio: 'inherit' });
  console.log('✅ Playwright browsers installed');
} catch (error) {
  console.warn('⚠️ Playwright installation failed:', error.message);
}

console.log('\n🎉 Test environment setup completed!');
console.log('\n📋 Available test commands:');
console.log('  Backend tests:');
console.log('    npm run test              # Run all backend tests');
console.log('    npm run test:system       # Run system tests');
console.log('    npm run test:integration  # Run integration tests');
console.log('    npm run test:coverage     # Run tests with coverage');
console.log('\n  Frontend tests:');
console.log('    cd frontend && npm test   # Run E2E tests');
console.log('    cd frontend && npm run test:ui      # Run tests with UI');
console.log('    cd frontend && npm run test:headed  # Run tests in headed mode');
console.log('\n  Full test suite:');
console.log('    npm run test:all          # Run all tests (backend + frontend)');
console.log('\n💡 Make sure to start your development servers before running E2E tests:');
console.log('    npm run dev (in api folder)');
console.log('    npm run dev (in frontend folder)');