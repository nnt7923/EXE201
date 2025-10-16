const { MongoClient } = require('mongodb');

async function checkItineraryData() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('an-gi-o-dau');
    const itinerariesCollection = db.collection('itineraries');
    
    // Kiểm tra lịch trình với ID cụ thể
    const itineraryId = '68f15905793138d0da86fce9';
    const itinerary = await itinerariesCollection.findOne({ _id: itineraryId });
    
    if (itinerary) {
      console.log('\n📋 ITINERARY DATA:');
      console.log('ID:', itinerary._id);
      console.log('Title:', itinerary.title);
      console.log('User ID:', itinerary.user);
      console.log('Date:', itinerary.date);
      console.log('isAiGenerated:', itinerary.isAiGenerated);
      console.log('Has aiContent:', !!itinerary.aiContent);
      console.log('aiContent length:', itinerary.aiContent ? itinerary.aiContent.length : 0);
      console.log('Activities count:', itinerary.activities ? itinerary.activities.length : 0);
      
      if (itinerary.aiContent) {
        console.log('\n📝 AI CONTENT PREVIEW:');
        console.log(itinerary.aiContent.substring(0, 300) + '...');
      }
      
      if (itinerary.activities && itinerary.activities.length > 0) {
        console.log('\n🎯 EXISTING ACTIVITIES:');
        itinerary.activities.forEach((activity, index) => {
          console.log(`${index + 1}. ${activity.title || activity.description}`);
        });
      }
    } else {
      console.log('❌ Itinerary not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkItineraryData();