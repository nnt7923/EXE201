#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running complete test suite for An Gi Ở Đâu Platform...\n');

let backendServer = null;
let frontendServer = null;

// Function to run command and return promise
function runCommand(command, cwd, description) {
  return new Promise((resolve, reject) => {
    console.log(`📦 ${description}...`);
    
    const child = spawn(command, { 
      shell: true, 
      cwd: cwd,
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completed\n`);
        resolve();
      } else {
        console.error(`❌ ${description} failed with code ${code}\n`);
        reject(new Error(`${description} failed`));
      }
    });
  });
}

// Function to start server
function startServer(command, cwd, description) {
  return new Promise((resolve) => {
    console.log(`🚀 Starting ${description}...`);
    
    const server = spawn(command, {
      shell: true,
      cwd: cwd,
      stdio: 'pipe'
    });
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('ready') || output.includes('listening') || output.includes('started')) {
        console.log(`✅ ${description} is ready\n`);
        resolve(server);
      }
    });
    
    // Fallback timeout
    setTimeout(() => {
      console.log(`⏰ ${description} timeout - assuming ready\n`);
      resolve(server);
    }, 10000);
  });
}

async function runTests() {
  const rootDir = path.join(__dirname, '..');
  const apiDir = path.join(rootDir, 'api');
  const frontendDir = path.join(rootDir, 'frontend');
  
  try {
    // 1. Run backend unit and integration tests
    console.log('🔧 Running Backend Tests...');
    await runCommand('npm run test:coverage', apiDir, 'Backend unit and integration tests');
    
    // 2. Start backend server for E2E tests
    console.log('🚀 Starting servers for E2E tests...');
    backendServer = await startServer('npm run dev', apiDir, 'Backend server');
    
    // Wait a bit for backend to fully start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 3. Start frontend server
    frontendServer = await startServer('npm run dev', frontendDir, 'Frontend server');
    
    // Wait a bit for frontend to fully start
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 4. Run E2E tests
    console.log('🎭 Running Frontend E2E Tests...');
    await runCommand('npm test', frontendDir, 'Frontend E2E tests');
    
    console.log('🎉 All tests completed successfully!');
    
    // Generate test report
    console.log('📊 Generating test reports...');
    try {
      await runCommand('npm run test:report', frontendDir, 'Generating Playwright report');
    } catch (error) {
      console.warn('⚠️ Could not generate Playwright report');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  } finally {
    // Cleanup: Kill servers
    if (backendServer) {
      console.log('🛑 Stopping backend server...');
      backendServer.kill();
    }
    if (frontendServer) {
      console.log('🛑 Stopping frontend server...');
      frontendServer.kill();
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test suite interrupted');
  if (backendServer) backendServer.kill();
  if (frontendServer) frontendServer.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test suite terminated');
  if (backendServer) backendServer.kill();
  if (frontendServer) frontendServer.kill();
  process.exit(0);
});

// Run the tests
runTests();