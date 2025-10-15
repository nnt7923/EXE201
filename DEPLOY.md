# Hướng dẫn Deploy lên Render

## Chuẩn bị trước khi deploy

### 1. Tạo MongoDB Atlas Database (QUAN TRỌNG)
1. Truy cập [MongoDB Atlas](https://cloud.mongodb.com/)
2. Tạo cluster miễn phí
3. Tạo database user và password
4. Lấy connection string (dạng: `mongodb+srv://username:password@cluster.mongodb.net/database_name`)

### 2. Chuẩn bị API Keys
- **Cloudinary**: Đăng ký tại [cloudinary.com](https://cloudinary.com) để upload ảnh
- **Google Gemini AI**: Lấy API key từ [Google AI Studio](https://makersuite.google.com/app/apikey)

## Deploy trên Render

### Cách 1: Deploy từ GitHub (Khuyến nghị)

1. **Push code lên GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Tạo Backend Service**
   - Truy cập [Render Dashboard](https://dashboard.render.com/)
   - Chọn "New" → "Web Service"
   - Connect GitHub repository
   - Cấu hình:
     - **Name**: `an-gi-o-dau-api`
     - **Root Directory**: `api`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Cấu hình Environment Variables cho Backend**
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=[tạo random string mạnh]
   MONGODB_URI=[connection string từ MongoDB Atlas]
   CLOUDINARY_CLOUD_NAME=[từ Cloudinary]
   CLOUDINARY_API_KEY=[từ Cloudinary]
   CLOUDINARY_API_SECRET=[từ Cloudinary]
   GEMINI_API_KEY=[từ Google AI Studio]
   FRONTEND_URL=https://an-gi-o-dau-frontend.onrender.com
   ```

4. **Tạo Frontend Service**
   - Tạo service mới
   - Cấu hình:
     - **Name**: `an-gi-o-dau-frontend`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free

5. **Cấu hình Environment Variables cho Frontend**
   ```
   NEXT_PUBLIC_API_URL=https://an-gi-o-dau-api.onrender.com/api
   ```

### Cách 2: Deploy bằng render.yaml

1. Đặt file `render.yaml` ở root directory
2. Push lên GitHub
3. Trong Render Dashboard, chọn "New" → "Blueprint"
4. Connect repository và deploy

## Lưu ý quan trọng

### 🚨 Bảo mật
- **KHÔNG BAO GIỜ** commit file `.env` lên GitHub
- Sử dụng `.env.example` làm template
- Tạo JWT_SECRET mạnh (ít nhất 32 ký tự random)

### 💾 Database
- Sử dụng MongoDB Atlas (free tier 512MB)
- Backup database thường xuyên
- Kiểm tra connection string đúng format

### 🔄 Free Tier Limitations
- **Render Free**: Service sleep sau 15 phút không hoạt động
- **MongoDB Atlas Free**: 512MB storage
- **Cold start**: Lần đầu truy cập có thể chậm

### 🐛 Troubleshooting

**Lỗi thường gặp:**
1. **Build failed**: Kiểm tra dependencies trong package.json
2. **Database connection**: Kiểm tra MONGODB_URI và network access
3. **CORS errors**: Kiểm tra FRONTEND_URL trong backend
4. **API not found**: Kiểm tra NEXT_PUBLIC_API_URL trong frontend

**Kiểm tra logs:**
- Render Dashboard → Service → Logs
- Kiểm tra health check: `https://your-api.onrender.com/api/health`

## Sau khi deploy

1. **Test các chức năng chính**
   - Đăng ký/đăng nhập
   - Upload ảnh
   - AI suggestions
   - Payment flow

2. **Monitor performance**
   - Kiểm tra response time
   - Monitor database usage
   - Theo dõi error logs

3. **Setup domain (tùy chọn)**
   - Mua domain
   - Cấu hình DNS trong Render

## Commands hữu ích

```bash
# Test local trước khi deploy
npm run test
npm run build

# Check health
curl https://your-api.onrender.com/api/health

# View logs
render logs --service=an-gi-o-dau-api
```