const mongoose = require('./api/node_modules/mongoose');
const Place = require('./api/models/Place');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau';

async function updatePlace(filter, update) {
  if (!filter || !update) {
    console.error('Error: Filter and update objects are required.');
    return;
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    console.log('Finding and updating place...');
    console.log('Filter:', filter);
    console.log('Update:', update);

    const result = await Place.findOneAndUpdate(filter, { $set: update }, { new: true });

    if (result) {
      console.log('✅ Successfully updated place:', result.name);
      console.log('New address:', result.address);
    } else {
      console.log('❌ No place found matching the filter.');
    }

  } catch (error) {
    console.error('❌ Error updating place:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

// Check for command line arguments
if (process.argv.length > 3) {
  try {
    const filter = JSON.parse(process.argv[2]);
    const update = JSON.parse(process.argv[3]);
    updatePlace(filter, update);
  } catch (e) {
    console.error('Error parsing arguments from command line. Please provide valid JSON strings.');
    console.error("Example: node update_place.js '{\"name\":\"Old Name\"}' '{\"name\":\"New Name\"}'");
  }
} else {
    console.log('Usage: node update_place.js \'<filter_json>\' \'<update_json>\'');
}
