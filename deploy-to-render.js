#!/usr/bin/env node

console.log('🚀 HƯỚNG DẪN DEPLOY LÊN RENDER FREE TIER');
console.log('=====================================\n');

console.log('✅ CÁC FILE ĐÃ CHUẨN BỊ:');
console.log('   📄 render.yaml - Cấu hình deployment');
console.log('   📄 api/Dockerfile - Container cho backend');
console.log('   📄 frontend/Dockerfile - Container cho frontend');
console.log('   📄 .env.example - Template environment variables');
console.log('   📄 DEPLOY.md - Hướng dẫn chi tiết\n');

console.log('🔧 BƯỚC TIẾP THEO:');
console.log('1. 📤 Push code lên GitHub:');
console.log('   git add .');
console.log('   git commit -m "Ready for Render deployment"');
console.log('   git push origin main\n');

console.log('2. 🗄️  Tạo MongoDB Atlas database (QUAN TRỌNG):');
console.log('   - Truy cập: https://cloud.mongodb.com/');
console.log('   - Tạo cluster miễn phí');
console.log('   - Lấy connection string\n');

console.log('3. 🔑 Chuẩn bị API Keys:');
console.log('   - Cloudinary: https://cloudinary.com');
console.log('   - Google Gemini: https://makersuite.google.com/app/apikey\n');

console.log('4. 🌐 Deploy trên Render:');
console.log('   - Truy cập: https://dashboard.render.com/');
console.log('   - New → Web Service');
console.log('   - Connect GitHub repository');
console.log('   - Chọn "Deploy from Blueprint" và sử dụng render.yaml\n');

console.log('5. ⚙️  Cấu hình Environment Variables:');
console.log('   Backend:');
console.log('   - JWT_SECRET=[random string 32+ ký tự]');
console.log('   - MONGODB_URI=[từ MongoDB Atlas]');
console.log('   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
console.log('   - GEMINI_API_KEY');
console.log('   - FRONTEND_URL=https://your-frontend.onrender.com\n');
console.log('   Frontend:');
console.log('   - NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api\n');

console.log('⚠️  LƯU Ý QUAN TRỌNG:');
console.log('   🔒 KHÔNG commit file .env lên GitHub');
console.log('   ⏰ Free tier: Service sleep sau 15 phút không dùng');
console.log('   🐌 Cold start: Lần đầu truy cập có thể chậm');
console.log('   💾 MongoDB Atlas free: 512MB storage\n');

console.log('🔍 KIỂM TRA SAU KHI DEPLOY:');
console.log('   - Health check: https://your-api.onrender.com/api/health');
console.log('   - Test đăng ký/đăng nhập');
console.log('   - Test upload ảnh');
console.log('   - Test AI suggestions\n');

console.log('📖 Chi tiết trong file DEPLOY.md');
console.log('🎉 Chúc bạn deploy thành công!');