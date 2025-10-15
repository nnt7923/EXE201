const mongoose = require('mongoose');
const path = require('path');

// Load test environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.test') });

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB test database');
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model('Test', testSchema);
    
    const testDoc = new TestModel({ name: 'test' });
    await testDoc.save();
    console.log('✅ Successfully created test document');
    
    // Clean up
    await TestModel.deleteMany({});
    console.log('✅ Successfully cleaned up test data');
    
    await mongoose.disconnect();
    console.log('✅ Database connection test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    process.exit(1);
  }
}

testDatabaseConnection();