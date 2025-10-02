const mongoose = require('./api/node_modules/mongoose');
const https = require('https');
const Place = require('./api/models/Place');
const User = require('./api/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau';

// Function to perform reverse geocoding using OpenStreetMap Nominatim
function reverseGeocode(lat, lon) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'nominatim.openstreetmap.org',
      path: `/reverse?format=json&lat=${lat}&lon=${lon}`,
      headers: {
        'User-Agent': 'AnGiODau-Platform-Script/1.0' // Nominatim requires a custom User-Agent
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.error) {
            return reject(new Error(jsonData.error));
          }
          // Map Nominatim address fields to our schema
          const address = {
            street: jsonData.address.road || 'Không rõ tên đường',
            ward: jsonData.address.suburb || jsonData.address.village || 'Không rõ phường/xã',
            district: jsonData.address.city_district || jsonData.address.county || 'Không rõ quận/huyện',
            city: jsonData.address.city || 'Hà Nội'
          };
          resolve(address);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function addPlace(placeData) {
  if (!placeData || !placeData.location || !placeData.location.coordinates) {
    console.error('Error: Invalid place data provided. Coordinates are required.');
    return;
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // If address is not provided, fetch it using reverse geocoding
    if (!placeData.address) {
      console.log(`Address not provided. Performing reverse geocoding for coordinates...`);
      const [lon, lat] = placeData.location.coordinates;
      try {
        const newAddress = await reverseGeocode(lat, lon);
        placeData.address = newAddress;
        console.log('✅ Reverse geocoding successful:', newAddress);
      } catch (geocodeError) {
        console.error('❌ Reverse geocoding failed:', geocodeError.message);
        console.log('Using placeholder address instead.');
        placeData.address = {
            street: 'Đường mẫu (lỗi geocode)',
            ward: 'Phường mẫu',
            district: 'Quận mẫu'
        };
      }
    }

    console.log('Finding a user to be the author...');
    const user = await User.findOne();
    if (!user) {
      throw new Error('No users found in the database. Cannot assign a creator.');
    }
    console.log(`✅ Found user: ${user.name} (${user._id})`);

    const newPlaceData = {
      ...placeData,
      createdBy: user._id,
      description: placeData.description || `Mô tả cho ${placeData.name}`,
      category: placeData.category || 'entertainment',
      subcategory: placeData.subcategory || 'Khác',
      isVerified: true,
      isActive: true,
    };

    console.log('Creating new place...');
    const place = new Place(newPlaceData);
    await place.save();

    console.log(`✅ Successfully created new place "${place.name}"`);

  } catch (error) {
    console.error('❌ Error adding place:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

// Check for command line arguments
if (process.argv.length > 2) {
  try {
    const placeDataFromArg = JSON.parse(process.argv[2]);
    addPlace(placeDataFromArg);
  } catch (e) {
    console.error('Error parsing place data from command line. Please provide a valid JSON string.');
    console.error("Example: node add_place_script.js '{\"name\":\"My New Place\", \"location\":{\"type\":\"Point\",\"coordinates\":[105.5,21.0]}}'");
  }
} else {
    console.log('Usage: node add_place_script.js \'<json_data>\'');
    console.log('Please provide the place data as a JSON string argument.');
}
