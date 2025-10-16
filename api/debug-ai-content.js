const mongoose = require('mongoose');
const Itinerary = require('./models/Itinerary');

async function debugAiContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau');
    console.log('Connected to MongoDB');
    
    // List all AI itineraries
    const itineraries = await Itinerary.find({ isAiGenerated: true }).select('_id title aiContent');
    console.log('📋 AI Itineraries found:', itineraries.length);
    
    itineraries.forEach((itinerary, index) => {
      console.log(`${index + 1}. ID: ${itinerary._id}`);
      console.log(`   Title: ${itinerary.title}`);
      console.log(`   Has AI Content: ${!!itinerary.aiContent}`);
      console.log(`   Content Length: ${itinerary.aiContent?.length || 0}`);
      if (itinerary.aiContent) {
        console.log(`   Preview: ${itinerary.aiContent.substring(0, 100)}...`);
        console.log(`   Starts with {: ${itinerary.aiContent.trim().startsWith('{')}`);
        console.log(`   Contains Ngày: ${itinerary.aiContent.includes('Ngày')}`);
        console.log(`   Contains **: ${itinerary.aiContent.includes('**')}`);
        console.log(`   Contains ###: ${itinerary.aiContent.includes('###')}`);
      }
      console.log('');
    });
    
    // Try to find the specific one from URL
    const specificId = '68f15b46b8521bfa081a32ed';
    const specific = await Itinerary.findById(specificId);
    if (specific) {
      console.log('🎯 Found specific itinerary:', specificId);
      console.log('   Title:', specific.title);
      console.log('   AI Content Length:', specific.aiContent?.length || 0);
      if (specific.aiContent) {
        console.log('   First 500 chars:');
        console.log(specific.aiContent.substring(0, 500));
      }
    } else {
      console.log('❌ Specific itinerary not found:', specificId);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

debugAiContent();