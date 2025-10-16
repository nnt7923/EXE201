const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

async function checkSpecificItinerary() {
  try {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('an-gi-o-dau');
    
    // Check the itinerary from URL
    const itinerary = await db.collection('itineraries').findOne({
      _id: new ObjectId('68f15b46b8521bfa081a32ed')
    });
    
    if (itinerary) {
      console.log('✅ Itinerary found!');
      console.log('📊 Details:');
      console.log('   _id:', itinerary._id);
      console.log('   title:', itinerary.title);
      console.log('   isAiGenerated:', itinerary.isAiGenerated);
      console.log('   hasAiContent:', !!itinerary.aiContent);
      
      if (itinerary.aiContent) {
        console.log('   aiContentLength:', itinerary.aiContent.length);
        console.log('\n=== FULL AI CONTENT ===');
        console.log(itinerary.aiContent);
        console.log('=== END AI CONTENT ===');
      } else {
        console.log('   ❌ No AI content');
      }
    } else {
      console.log('❌ Itinerary not found');
    }
    
    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSpecificItinerary();