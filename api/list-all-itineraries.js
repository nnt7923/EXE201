const { MongoClient } = require('mongodb');

async function listAllItineraries() {
  try {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('an-gi-o-dau');
    
    const itineraries = await db.collection('itineraries').find({}).toArray();
    
    console.log(`Found ${itineraries.length} itineraries total`);
    
    itineraries.forEach((it, index) => {
      console.log(`${index + 1}. ID: ${it._id}`);
      console.log(`   Title: ${it.title}`);
      console.log(`   isAiGenerated: ${it.isAiGenerated}`);
      console.log(`   hasAiContent: ${!!it.aiContent}`);
      if (it.aiContent) {
        console.log(`   aiContent length: ${it.aiContent.length}`);
        console.log(`   aiContent preview: ${it.aiContent.substring(0, 50)}...`);
      }
      console.log('---');
    });
    
    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

listAllItineraries();