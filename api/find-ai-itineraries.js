const { MongoClient } = require('mongodb');

async function findAiItineraries() {
  try {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('an-gi-o-dau');
    
    const itineraries = await db.collection('itineraries').find({
      isAiGenerated: true,
      aiContent: { $exists: true, $ne: null }
    }).toArray();
    
    console.log('Found', itineraries.length, 'AI itineraries');
    itineraries.forEach((it, index) => {
      console.log(`${index + 1}. ID: ${it._id}, Title: ${it.title}`);
      if (it.aiContent) {
        console.log(`   AI Content length: ${it.aiContent.length}`);
        console.log(`   AI Content preview: ${it.aiContent.substring(0, 100)}...`);
      }
    });
    
    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

findAiItineraries();