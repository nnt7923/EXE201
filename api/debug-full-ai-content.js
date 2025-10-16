const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

async function checkFullAiContent() {
  try {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('an-gi-o-dau');
    
    const itinerary = await db.collection('itineraries').findOne({
      _id: new ObjectId('68f15905793138d0da86fce9')
    });
    
    if (itinerary && itinerary.aiContent) {
      console.log('=== FULL AI CONTENT ===');
      console.log(itinerary.aiContent);
      console.log('=== END AI CONTENT ===');
      console.log('\n=== AI CONTENT LENGTH ===');
      console.log('Length:', itinerary.aiContent.length);
      console.log('\n=== AI CONTENT TYPE ===');
      console.log('Type:', typeof itinerary.aiContent);
    } else {
      console.log('❌ No AI content found');
    }
    
    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkFullAiContent();