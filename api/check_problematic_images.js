const mongoose = require('mongoose');
require('dotenv').config();

const Place = require('./models/Place');

async function checkPlaces() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const places = await Place.find({ 
      $or: [
        { image: { $regex: 'pastaxi-dot-com', $options: 'i' } },
        { image: { $regex: 'bay-coffee', $options: 'i' } }
      ]
    });
    
    console.log('Places with problematic images:', places.length);
    places.forEach(place => {
      console.log('Place:', place.name, 'Image:', place.image);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPlaces();