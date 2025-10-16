const mongoose = require('mongoose');
const Itinerary = require('./models/Itinerary');

async function checkAiItinerary() {
  try {
    await mongoose.connect('mongodb://localhost:27017/an-gi-o-dau-platform');
    console.log('Connected to MongoDB');

    const itineraryId = '68f15905793138d0da86fce9';
    
    const itinerary = await Itinerary.findById(itineraryId);
    
    if (!itinerary) {
      console.log('❌ Itinerary not found');
      process.exit(1);
    }

    console.log('✅ Itinerary found!');
    console.log('📊 Details:');
    console.log('   _id:', itinerary._id);
    console.log('   title:', itinerary.title);
    console.log('   user:', itinerary.user);
    console.log('   isAiGenerated:', itinerary.isAiGenerated);
    console.log('   hasAiContent:', !!itinerary.aiContent);
    console.log('   aiContentLength:', itinerary.aiContent?.length || 0);
    
    if (itinerary.aiContent) {
      console.log('\n📝 AI Content preview (first 200 chars):');
      console.log(itinerary.aiContent.substring(0, 200) + '...');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAiItinerary();