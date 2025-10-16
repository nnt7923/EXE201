const { MongoClient } = require('mongodb');

async function checkItineraryData() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('an-gi-o-dau');
    const itinerariesCollection = db.collection('itineraries');
    
    // Tìm lịch trình theo ID cụ thể từ console log
    const specificId = '68f15b46b8521bfa081a32ed';
    console.log(`\n🔍 Looking for specific itinerary: ${specificId}`);
    const specificItinerary = await itinerariesCollection.findOne({ _id: specificId });
    
    if (specificItinerary) {
      console.log('✅ Found specific itinerary!');
    } else {
      console.log('❌ Specific itinerary not found, checking all...');
    }
    
    // Tìm tất cả lịch trình
    console.log('\n🔍 Looking for all itineraries...');
    const allItineraries = await itinerariesCollection.find({}).sort({ _id: -1 }).limit(10).toArray();
    
    console.log(`Found ${allItineraries.length} total itineraries:`);
    allItineraries.forEach((it, index) => {
      console.log(`${index + 1}. ID: ${it._id}, Title: ${it.title}, User: ${it.user}, isAiGenerated: ${it.isAiGenerated}`);
    });
    
    // Tìm lịch trình AI
    const aiItineraries = await itinerariesCollection.find({ isAiGenerated: true }).sort({ _id: -1 }).limit(5).toArray();
    console.log(`\n🤖 Found ${aiItineraries.length} AI itineraries`);
    
    // Ưu tiên lịch trình cụ thể, nếu không có thì lấy đầu tiên
    const itinerary = specificItinerary || allItineraries[0];
    
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