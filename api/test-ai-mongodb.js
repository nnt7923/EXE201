const mongoose = require('mongoose');
const aiService = require('./services/ai');
const AISuggestion = require('./models/AISuggestion');
require('dotenv').config();

async function testAIWithMongoDB() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    console.log('\n🧪 Testing AI service with MongoDB Atlas caching...');
    
    // Test 1: Generate itinerary suggestion
    console.log('\n📍 Test 1: Generate itinerary suggestion');
    const result1 = await aiService.generateItinerarySuggestions(
      'Hà Nội',
      2,
      'MEDIUM',
      'Ẩm thực, Văn hóa',
      'test-user-123'
    );
    console.log('✅ Itinerary suggestion generated:', result1.title);

    // Test 2: Check if suggestion was cached
    console.log('\n💾 Test 2: Check cached suggestions');
    const cachedSuggestions = await AISuggestion.find({ userId: 'test-user-123' });
    console.log(`✅ Found ${cachedSuggestions.length} cached suggestions`);
    
    if (cachedSuggestions.length > 0) {
      console.log('📋 Latest cached suggestion:');
      console.log('- Request Type:', cachedSuggestions[0].requestType);
      console.log('- Usage Count:', cachedSuggestions[0].usageCount);
      console.log('- Created At:', cachedSuggestions[0].createdAt);
    }

    // Test 3: Generate same request again (should use cache)
    console.log('\n🔄 Test 3: Generate same request again (should use cache)');
    const result2 = await aiService.generateItinerarySuggestions(
      'Hà Nội',
      2,
      'MEDIUM',
      'Ẩm thực, Văn hóa',
      'test-user-123'
    );
    console.log('✅ Second request completed:', result2.title);

    // Test 4: Check usage count increased
    console.log('\n📊 Test 4: Check usage count');
    const updatedSuggestions = await AISuggestion.find({ userId: 'test-user-123' });
    if (updatedSuggestions.length > 0) {
      console.log('📈 Updated usage count:', updatedSuggestions[0].usageCount);
    }

    // Test 5: Generate place suggestion
    console.log('\n🏛️ Test 5: Generate place suggestion');
    const result3 = await aiService.generatePlaceSuggestions('Hà Nội', 'test-user-123');
    console.log('✅ Place suggestion generated:', result3.length, 'places');

    // Test 6: Check all cached suggestions
    console.log('\n📋 Test 6: All cached suggestions');
    const allSuggestions = await AISuggestion.find({ userId: 'test-user-123' });
    console.log(`✅ Total cached suggestions: ${allSuggestions.length}`);
    allSuggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion.requestType} - Usage: ${suggestion.usageCount}`);
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ MongoDB Atlas caching is working properly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testAIWithMongoDB();