const mongoose = require('mongoose');
const Itinerary = require('./models/Itinerary');
require('dotenv').config();

async function testItineraryResponse() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test the specific itinerary
    const itineraryId = '68f14e66e3c2cabf57f58d4d';
    console.log(`\n🔍 Testing itinerary: ${itineraryId}`);

    const itinerary = await Itinerary.findById(itineraryId);
    
    if (!itinerary) {
      console.log('❌ Itinerary not found');
      return;
    }

    console.log('\n📊 Raw Database Data:');
    console.log('- _id:', itinerary._id);
    console.log('- title:', itinerary.title);
    console.log('- isAiGenerated:', itinerary.isAiGenerated);
    console.log('- aiContent exists:', !!itinerary.aiContent);
    console.log('- aiContent type:', typeof itinerary.aiContent);
    console.log('- aiContent value:', itinerary.aiContent);
    console.log('- activities count:', itinerary.activities ? itinerary.activities.length : 0);

    // Simulate API response format
    const apiResponse = {
      success: true,
      data: {
        itinerary: {
          _id: itinerary._id,
          title: itinerary.title,
          description: itinerary.description,
          date: itinerary.date,
          isAiGenerated: itinerary.isAiGenerated,
          aiContent: itinerary.aiContent,
          activities: itinerary.activities || [],
          userId: itinerary.userId,
          isActive: itinerary.isActive
        }
      }
    };

    console.log('\n🌐 Simulated API Response:');
    console.log('- success:', apiResponse.success);
    console.log('- data.itinerary.isAiGenerated:', apiResponse.data.itinerary.isAiGenerated);
    console.log('- data.itinerary.aiContent:', apiResponse.data.itinerary.aiContent);

    // Test the condition used in frontend
    const shouldShowAiInfo = apiResponse.data.itinerary.isAiGenerated === true;
    console.log('\n🎯 Frontend Logic Test:');
    console.log('- Should show AI info:', shouldShowAiInfo);
    console.log('- Condition: itinerary.isAiGenerated === true');
    console.log('- Actual value:', apiResponse.data.itinerary.isAiGenerated);
    console.log('- Type:', typeof apiResponse.data.itinerary.isAiGenerated);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

testItineraryResponse();