const fs = require('fs');
const path = require('path');

console.log('🔍 Environment Configuration Validation\n');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

let passedChecks = 0;
let totalChecks = 0;
const issues = [];
const warnings = [];

// Required environment variables
const requiredEnvVars = [
    'JWT_SECRET',
    'MONGODB_URI',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'GEMINI_API_KEY'
];

// Optional but recommended
const recommendedEnvVars = [
    'PORT',
    'NODE_ENV',
    'FRONTEND_URL'
];

console.log('1. Checking Required Environment Variables...');
totalChecks++;

let missingRequired = [];
requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        missingRequired.push(varName);
    }
});

if (missingRequired.length === 0) {
    console.log('✅ All required environment variables are set');
    passedChecks++;
} else {
    console.log('❌ Missing required environment variables:');
    missingRequired.forEach(varName => {
        console.log(`   - ${varName}`);
    });
    issues.push(`Missing required environment variables: ${missingRequired.join(', ')}`);
}

console.log('\n2. Checking Recommended Environment Variables...');
totalChecks++;

let missingRecommended = [];
recommendedEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        missingRecommended.push(varName);
    }
});

if (missingRecommended.length === 0) {
    console.log('✅ All recommended environment variables are set');
    passedChecks++;
} else {
    console.log('⚠️  Missing recommended environment variables:');
    missingRecommended.forEach(varName => {
        console.log(`   - ${varName}`);
    });
    warnings.push(`Missing recommended environment variables: ${missingRecommended.join(', ')}`);
    passedChecks++; // Not critical
}

console.log('\n3. Validating Environment Variable Values...');
totalChecks++;

let validationIssues = [];

// Check JWT_SECRET strength
if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
        validationIssues.push('JWT_SECRET should be at least 32 characters long');
    }
    if (process.env.JWT_SECRET === 'your_jwt_secret_here') {
        validationIssues.push('JWT_SECRET is still using default value');
    }
}

// Check MongoDB URI format
if (process.env.MONGODB_URI) {
    if (!process.env.MONGODB_URI.startsWith('mongodb')) {
        validationIssues.push('MONGODB_URI should start with mongodb:// or mongodb+srv://');
    }
    if (process.env.MONGODB_URI.includes('username:password')) {
        validationIssues.push('MONGODB_URI contains placeholder credentials');
    }
}

// Check Cloudinary config
if (process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
    validationIssues.push('CLOUDINARY_CLOUD_NAME is still using default value');
}

// Check Gemini API key
if (process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
    validationIssues.push('GEMINI_API_KEY is still using default value');
}

// Check NODE_ENV
if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    validationIssues.push('NODE_ENV should be development, production, or test');
}

if (validationIssues.length === 0) {
    console.log('✅ Environment variable values are valid');
    passedChecks++;
} else {
    console.log('❌ Environment variable validation issues:');
    validationIssues.forEach(issue => {
        console.log(`   - ${issue}`);
    });
    issues.push(...validationIssues);
}

console.log('\n4. Checking Configuration Files...');
totalChecks++;

const configFiles = [
    'package.json',
    '.env.example',
    '../frontend/package.json'
];

let missingFiles = [];
configFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
    }
});

if (missingFiles.length === 0) {
    console.log('✅ All configuration files are present');
    passedChecks++;
} else {
    console.log('❌ Missing configuration files:');
    missingFiles.forEach(file => {
        console.log(`   - ${file}`);
    });
    issues.push(`Missing configuration files: ${missingFiles.join(', ')}`);
}

console.log('\n5. Checking Production Readiness...');
totalChecks++;

let productionIssues = [];

// Check if .env file exists
if (!fs.existsSync(path.join(__dirname, '.env'))) {
    productionIssues.push('.env file not found in api directory');
}

// Check if NODE_ENV is set for production
if (process.env.NODE_ENV !== 'production') {
    warnings.push('NODE_ENV is not set to production');
}

// Check if PORT is configured
if (!process.env.PORT) {
    warnings.push('PORT is not configured (will default to 5000)');
}

if (productionIssues.length === 0) {
    console.log('✅ Production configuration looks good');
    passedChecks++;
} else {
    console.log('❌ Production readiness issues:');
    productionIssues.forEach(issue => {
        console.log(`   - ${issue}`);
    });
    issues.push(...productionIssues);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('ENVIRONMENT CONFIGURATION SUMMARY');
console.log('='.repeat(50));
console.log(`Checks Passed: ${passedChecks}/${totalChecks}`);
console.log(`Success Rate: ${((passedChecks/totalChecks) * 100).toFixed(1)}%`);

if (issues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
    });
}

if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
    });
}

if (passedChecks === totalChecks && issues.length === 0) {
    console.log('\n🎉 ENVIRONMENT CONFIGURATION IS READY FOR PRODUCTION!');
    console.log('✅ All checks passed successfully');
} else if (passedChecks >= totalChecks * 0.8 && issues.length <= 2) {
    console.log('\n⚠️  ENVIRONMENT MOSTLY READY');
    console.log('✅ Configuration is acceptable with minor issues');
} else {
    console.log('\n❌ ENVIRONMENT NEEDS ATTENTION');
    console.log('🔧 Please fix the issues before deploying to production');
}

// Exit with appropriate code
process.exit(issues.length > 0 ? 1 : 0);