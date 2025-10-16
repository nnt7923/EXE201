const mongoose = require('mongoose');
const Itinerary = require('./models/Itinerary');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/an-gi-o-dau', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const newAiContent = `
Lịch trình một ngày tại Hòa Lạc - Khám phá ẩm thực bình dân

### Buổi Sáng (7:00 - 11:30): Khởi Hành & Ăn Sáng

• 7:00 - 8:30: Di chuyển từ Hà Nội đến Hòa Lạc
• Phương tiện: Xe buýt công cộng là lựa chọn tiết kiệm nhất.
• Bạn có thể bắt các tuyến xe buýt như 74 (Mỹ Đình - Xuân Khanh) hoặc 88 (Bến xe Mỹ Đình - Hòa Lạc - Đại học Quốc gia) từ Bến xe Mỹ Đình. Hỏi lái xe hoặc phụ xe về điểm xuống gần khu vực làng Văn hóa hoặc các trường đại học.
• Chi phí ước tính: 15.000 VNĐ/lượt.

• 8:30 - 9:30: Ăn sáng chuẩn vị Hòa Lạc
• Sau khi xuống xe, tìm kiếm các quán ăn sáng xung quanh khu vực cổng Làng Văn hóa - Du lịch các Dân tộc Việt Nam, hoặc các khu dân cư gần các trường Đại học như Đại học Quốc gia Hà Nội (khu Hòa Lạc).
• Gợi ý món ăn:
  - Bún riêu cua hoặc Bún ốc: Nóng hổi, đậm đà, là món ăn sáng yêu thích của người dân địa phương và sinh viên. (Giá: 25.000 - 35.000 VNĐ)
  - Bánh mì chảo hoặc Bánh mì sốt vang: No bụng và giá cả phải chăng. (Giá: 25.000 - 40.000 VNĐ)
• Chi phí ước tính: 30.000 VNĐ.

• 9:30 - 11:30: Dạo quanh và tìm hiểu khu vực
• Đi bộ khám phá các con đường xung quanh Làng Văn hóa (từ bên ngoài, không mất phí vào cổng) hoặc các khu dân cư, ngõ nhỏ dẫn vào Đại học Quốc gia Hà Nội. Mục đích là để tìm các quán ăn vặt, chợ nhỏ hay cảm nhận nhịp sống sinh viên, công nhân tại đây.
• Hoạt động: Dừng chân uống một ly cà phê đen đá hoặc trà đá vỉa hè để giải khát và ngắm nhìn cuộc sống thường ngày. (Giá: 10.000 - 15.000 VNĐ)
• Chi phí ước tính: 15.000 VNĐ.

### Buổi Trưa (11:30 - 13:30): Bữa Trưa "Công Nhân - Sinh Viên"

• 11:30 - 13:00: Thưởng thức cơm bình dân hoặc đặc sản địa phương
• Hòa Lạc có rất nhiều quán cơm bình dân phục vụ đa dạng món ăn với giá cực kỳ phải chăng, rất phù hợp với sinh viên và người lao động.
• Gợi ý món ăn:
  - Cơm bình dân: Chọn 2-3 món mặn, rau, canh tùy thích. Giá chỉ khoảng 35.000 - 45.000 VNĐ/suất.
  - Bún chả hoặc Bún đậu mắm tôm: Nếu tìm được quán ngon, đây cũng là lựa chọn tuyệt vời cho bữa trưa. (Giá: 35.000 - 50.000 VNĐ)
• Chi phí ước tính: 40.000 VNĐ.

• 13:00 - 13:30: Nghỉ ngơi nhẹ nhàng
• Tìm một quán nước mía hoặc trà đá vỉa hè để giải khát và thư giãn sau bữa ăn. (Giá: khoảng 10.000 VNĐ)
• Chi phí ước tính: 10.000 VNĐ.

### Buổi Chiều (13:30 - 17:00): Khám Phá Ẩm Thực Vặt & Chợ Địa Phương

• 13:30 - 15:00: Tìm kiếm "kho báu" ẩm thực vặt
• Tiếp tục dạo quanh các khu vực dân cư, trường học để tìm các xe đẩy, quán vỉa hè bán đồ ăn vặt.
• Gợi ý món ăn:
  - Bánh rán, bánh gối, nem chua rán: Các món chiên nóng hổi, dễ ăn và rất được yêu thích. (Giá: 15.000 - 25.000 VNĐ)
  - Chè thập cẩm, tào phớ: Các món tráng miệng mát lạnh, giải nhiệt ngày hè. (Giá: 15.000 - 25.000 VNĐ)
• Chi phí ước tính: 25.000 VNĐ.

• 15:00 - 17:00: Ghé thăm chợ dân sinh (nếu có)
• Nếu bạn tìm được một khu chợ nhỏ tại Hòa Lạc, đây sẽ là trải nghiệm thú vị để quan sát đời sống địa phương và có thể mua vài loại trái cây tươi ngon, giá rẻ.
• Hoạt động: Mua một ít hoa quả địa phương (cam, ổi, xoài theo mùa) để tráng miệng hoặc mang về.
• Chi phí ước tính: 20.000 VNĐ (cho hoa quả).

### Buổi Tối (17:00 - 19:30): Bữa Tối Chia Tay & Trở Về

• 17:00 - 18:30: Bữa tối cuối cùng tại Hòa Lạc
• Chọn một quán ăn khác để thử món mới hoặc quay lại quán cơm bình dân yêu thích của bạn.
• Gợi ý món ăn:
  - Mì vằn thắn hoặc Hủ tiếu: Nếu có quán bán, đây là lựa chọn thay đổi khẩu vị. (Giá: 35.000 - 45.000 VNĐ)
  - Hoặc một suất cơm rang dưa bò nếu bạn thèm cơm rang. (Giá: 40.000 - 50.000 VNĐ)
• Chi phí ước tính: 45.000 VNĐ.

• 18:30 - 19:30: Di chuyển ra bến xe buýt và trở về Hà Nội
• Chi phí ước tính: 15.000 VNĐ/lượt.

Tổng chi phí ước tính cho cả ngày: ~ 220.000 VNĐ
`;

async function updateAiContent() {
  try {
    const itinerary = await Itinerary.findById('68e944ae73ba6b260fc98e68');
    
    if (!itinerary) {
      console.log('Itinerary not found');
      return;
    }
    
    console.log('Current AI content preview:', itinerary.aiContent ? itinerary.aiContent.substring(0, 200) + '...' : 'No AI content');
    
    // Update AI content
    itinerary.aiContent = newAiContent;
    itinerary.isAiGenerated = true;
    itinerary.hasAiContent = true;
    
    await itinerary.save();
    
    console.log('AI content updated successfully!');
    console.log('New AI content preview:', newAiContent.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('Error updating AI content:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateAiContent();