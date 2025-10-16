const mongoose = require('mongoose');
const Itinerary = require('./models/Itinerary');
const User = require('./models/User');

const aiContent = `
**Ngày 1:**
- 06:00 - 07:00: Khởi hành từ Hòa Lạc đi Hà Nội (ước tính 1 giờ di chuyển bằng ô tô)
- 07:00 - 08:30: Ăn sáng Phở Bò tại Phở Thìn (13 Lò Đúc, Hai Bà Trưng) - Một trong những quán phở nổi tiếng nhất Hà Nội với nước dùng đậm đà.
- 08:30 - 10:00: Khám phá Phố Cổ Hà Nội (Hàng Bạc, Hàng Gai, Hàng Đào) - Dạo bộ và cảm nhận nhịp sống của khu phố cổ kính.
- 10:00 - 11:30: Thưởng thức Bánh Mì Pâté tại Bánh Mì 25 (25 Hàng Cá, Hoàn Kiếm) - Bánh mì pâté truyền thống với nhân đầy đặn và giòn tan.
- 11:30 - 13:00: Ăn trưa Bún Đậu Mắm Tôm tại Bún Đậu Mắm Tôm Ngõ Gạch (Ngõ Gạch, Hoàn Kiếm) - Trải nghiệm món bún đậu mắm tôm chuẩn vị, đầy đủ nem, chả cốm, dồi sụn.
- 13:30 - 14:30: Thưởng thức Cà Phê Trứng tại Café Giảng (39 Nguyễn Hữu Huân, Hoàn Kiếm) - Một trong những quán cà phê trứng lâu đời và nổi tiếng nhất Hà Nội.
- 14:30 - 15:30: Dạo quanh Hồ Hoàn Kiếm và Cầu Thê Húc - Tận hưởng không khí trong lành và vẻ đẹp biểu tượng của thủ đô.
- 15:30 - 16:30: Trải nghiệm ẩm thực đường phố khác (Chè bốn mùa Hàng Cân, Kem Tràng Tiền) - Tiếp tục hành trình khám phá các món ăn vặt đặc trưng của Hà Nội.
- 16:30 - 18:00: Mua sắm quà lưu niệm ẩm thực tại Hàng Đường (Ô Mai Hồng Lam, Bánh Cốm Nguyên Ninh) - Chọn mua những món quà mang hương vị Hà Nội cho người thân.
- 18:00 - 19:30: Ăn tối Lẩu Bò Nhúng Dấm tại Quán Gầm Cầu (Cầu Gỗ, Hoàn Kiếm) - Một bữa tối ấm cúng và đầy đủ hương vị truyền thống.
- 19:30 - 21:00: Di chuyển về lại Hòa Lạc (ước tính 1.5 giờ di chuyển bằng ô tô)
- 21:00: Kết thúc hành trình tại Hòa Lạc
`;

async function createTestAiItinerary() {
  try {
    await mongoose.connect('mongodb://localhost:27017/an-gi-o-dau-platform');
    console.log('Connected to MongoDB');

    // Find the specific user by ID from login response
    const user = await User.findById('68ef55e2912dcc3428322fbd');
    if (!user) {
      console.log('❌ User 68ef55e2912dcc3428322fbd not found.');
      process.exit(1);
    }

    console.log('👤 Found user:', user.email);

    // Create test AI itinerary
    const itinerary = new Itinerary({
      title: 'Test AI Itinerary - Hành Trình Ẩm Thực Hà Nội',
      date: new Date(),
      description: 'Lịch trình AI test để kiểm tra hiển thị timeline',
      aiContent: aiContent,
      activities: [],
      isAiGenerated: true,
      user: user._id,
      isActive: true
    });

    const savedItinerary = await itinerary.save();
    
    console.log('✅ Test AI itinerary created successfully!');
    console.log('📊 Itinerary details:');
    console.log('   _id:', savedItinerary._id);
    console.log('   title:', savedItinerary.title);
    console.log('   isAiGenerated:', savedItinerary.isAiGenerated);
    console.log('   hasAiContent:', !!savedItinerary.aiContent);
    console.log('   aiContentLength:', savedItinerary.aiContent?.length || 0);
    console.log('   user:', savedItinerary.user);
    
    console.log('\n🔗 Frontend URL:');
    console.log(`   http://localhost:3000/itineraries/${savedItinerary._id}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestAiItinerary();