const mongoose = require('mongoose');
const Place = require('./models/Place');
require('dotenv').config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công');
    
    const count = await Place.countDocuments();
    console.log(`📊 Tổng số places trong database: ${count}`);
    
    const places = await Place.find({}, 'name category').limit(10);
    console.log('\n📍 10 places đầu tiên:');
    places.forEach((p, i) => {
      console.log(`${i+1}. ${p.name} (${p.category})`);
    });
    
    // Kiểm tra các places mới được thêm
    const newPlaces = await Place.find({
      name: { $in: ['siêu thị Big Trend', 'Vua Gà Quang Thọ', 'Memory PTB', 'Beta FPT Building'] }
    }, 'name category');
    
    console.log('\n🆕 Một số places mới được thêm:');
    newPlaces.forEach((p, i) => {
      console.log(`${i+1}. ${p.name} (${p.category})`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Đã ngắt kết nối MongoDB');
  }
}

checkDatabase();