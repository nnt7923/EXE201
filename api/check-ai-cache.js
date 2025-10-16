const mongoose = require('mongoose');
const AISuggestion = require('./models/AISuggestion');
require('dotenv').config();

async function checkAICache() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    console.log('\n📊 Checking AI suggestions cache in MongoDB Atlas...');
    
    // Get all AI suggestions
    const allSuggestions = await AISuggestion.find({}).sort({ createdAt: -1 });
    console.log(`\n📋 Total AI suggestions in cache: ${allSuggestions.length}`);
    
    if (allSuggestions.length > 0) {
      console.log('\n🔍 Recent AI suggestions:');
      allSuggestions.slice(0, 5).forEach((suggestion, index) => {
        console.log(`\n${index + 1}. ${suggestion.requestType.toUpperCase()} Suggestion:`);
        console.log(`   - ID: ${suggestion._id}`);
        console.log(`   - User ID: ${suggestion.userId}`);
        console.log(`   - Input Hash: ${suggestion.inputHash.substring(0, 16)}...`);
        console.log(`   - Usage Count: ${suggestion.usageCount}`);
        console.log(`   - Last Used: ${suggestion.lastUsed}`);
        console.log(`   - Created: ${suggestion.createdAt}`);
        
        if (suggestion.inputData) {
          console.log(`   - Input Data:`);
          if (suggestion.inputData.destination) console.log(`     * Destination: ${suggestion.inputData.destination}`);
          if (suggestion.inputData.duration) console.log(`     * Duration: ${suggestion.inputData.duration} days`);
          if (suggestion.inputData.budget) console.log(`     * Budget: ${suggestion.inputData.budget}`);
          if (suggestion.inputData.preferences) console.log(`     * Preferences: ${suggestion.inputData.preferences}`);
          if (suggestion.inputData.query) console.log(`     * Query: ${suggestion.inputData.query}`);
        }
        
        if (suggestion.aiResponse && suggestion.requestType === 'itinerary') {
          console.log(`   - Response Title: ${suggestion.aiResponse.title || 'N/A'}`);
        }
        
        if (suggestion.expiresAt) {
          console.log(`   - Expires At: ${suggestion.expiresAt}`);
        }
      });
      
      // Statistics
      console.log('\n📈 Cache Statistics:');
      const itineraryCount = allSuggestions.filter(s => s.requestType === 'itinerary').length;
      const placeCount = allSuggestions.filter(s => s.requestType === 'place').length;
      const totalUsage = allSuggestions.reduce((sum, s) => sum + s.usageCount, 0);
      
      console.log(`   - Itinerary suggestions: ${itineraryCount}`);
      console.log(`   - Place suggestions: ${placeCount}`);
      console.log(`   - Total cache hits: ${totalUsage}`);
      console.log(`   - Average usage per suggestion: ${(totalUsage / allSuggestions.length).toFixed(2)}`);
      
      // Check for expired suggestions
      const now = new Date();
      const expiredCount = allSuggestions.filter(s => s.expiresAt && s.expiresAt < now).length;
      console.log(`   - Expired suggestions: ${expiredCount}`);
    } else {
      console.log('📭 No AI suggestions found in cache');
    }

    console.log('\n✅ Cache check completed successfully!');

  } catch (error) {
    console.error('❌ Cache check failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

checkAICache();