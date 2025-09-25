# Ăn Gì Ở Đâu - Backend API

Backend API cho platform "Ăn Gì Ở Đâu" - ứng dụng tìm kiếm quán ăn, nhà trọ và địa điểm vui chơi tại Hòa Lạc.

## 🚀 Tính năng chính

- **Authentication & Authorization**: JWT-based authentication với role-based access control
- **Places Management**: CRUD operations cho địa điểm (quán ăn, nhà trọ, cafe, etc.)
- **Reviews System**: Hệ thống đánh giá và bình luận chi tiết
- **User Management**: Quản lý người dùng với profile và preferences
- **Geospatial Search**: Tìm kiếm địa điểm theo vị trí và bán kính
- **Advanced Filtering**: Lọc theo danh mục, giá cả, đánh giá, tính năng
- **Image Upload**: Hỗ trợ upload ảnh qua Cloudinary
- **Rate Limiting**: Bảo vệ API khỏi spam và abuse

## 🛠 Công nghệ sử dụng

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📦 Cài đặt

1. **Clone repository và cài đặt dependencies:**
```bash
cd backend
npm install
```

2. **Cấu hình environment variables:**
```bash
cp env.example .env
# Chỉnh sửa file .env với thông tin của bạn
```

3. **Cài đặt MongoDB:**
- Local: Cài đặt MongoDB Community Server
- Cloud: Sử dụng MongoDB Atlas (khuyến nghị)

4. **Chạy server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔧 Cấu hình Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/an-gi-o-dau

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
FRONTEND_URL=http://localhost:3000
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `PUT /api/auth/profile` - Cập nhật profile
- `POST /api/auth/change-password` - Đổi mật khẩu
- `POST /api/auth/logout` - Đăng xuất

### Places
- `GET /api/places` - Lấy danh sách địa điểm (có filter, search, pagination)
- `GET /api/places/:id` - Lấy chi tiết địa điểm
- `POST /api/places` - Tạo địa điểm mới (cần auth)
- `PUT /api/places/:id` - Cập nhật địa điểm (cần auth)
- `DELETE /api/places/:id` - Xóa địa điểm (cần auth)
- `GET /api/places/:id/reviews` - Lấy đánh giá của địa điểm
- `GET /api/places/categories/list` - Lấy danh sách categories

### Reviews
- `GET /api/reviews` - Lấy danh sách đánh giá
- `GET /api/reviews/:id` - Lấy chi tiết đánh giá
- `POST /api/reviews` - Tạo đánh giá mới (cần auth)
- `PUT /api/reviews/:id` - Cập nhật đánh giá (cần auth)
- `DELETE /api/reviews/:id` - Xóa đánh giá (cần auth)
- `POST /api/reviews/:id/helpful` - Đánh dấu đánh giá hữu ích (cần auth)
- `GET /api/reviews/user/:userId` - Lấy đánh giá của user

### Users
- `GET /api/users` - Lấy danh sách users (admin only)
- `GET /api/users/:id` - Lấy thông tin user
- `PUT /api/users/:id` - Cập nhật thông tin user
- `DELETE /api/users/:id` - Xóa user (soft delete)
- `GET /api/users/:id/places` - Lấy địa điểm của user
- `GET /api/users/:id/reviews` - Lấy đánh giá của user
- `GET /api/users/stats/overview` - Thống kê users (admin only)

### Health Check
- `GET /api/health` - Kiểm tra trạng thái API

## 🔍 Query Parameters

### Places Search
```
GET /api/places?page=1&limit=10&category=restaurant&subcategory=pho&minPrice=50000&maxPrice=100000&rating=4&search=pho&lat=21.0285&lng=105.8542&radius=5&sort=-rating&features=wifi,parking
```

### Reviews Filter
```
GET /api/reviews?page=1&limit=10&place=placeId&user=userId&rating=5&sort=-createdAt
```

## 🔐 Authentication

API sử dụng JWT Bearer token authentication:

```javascript
// Header
Authorization: Bearer <your-jwt-token>

// Example request
fetch('/api/places', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  }
})
```

## 📊 Database Schema

### User
- Basic info: name, email, password, avatar
- Contact: phone, address
- Preferences: favoriteCategories, budget
- Role: user, admin, moderator
- Status: isActive, lastLogin

### Place
- Basic info: name, description, category, subcategory
- Location: address with coordinates for geospatial search
- Contact: phone, email, website, social media
- Pricing: minPrice, maxPrice, currency
- Features: wifi, parking, airConditioning, etc.
- Images: array of image URLs
- Operating hours: weekly schedule
- Rating: average rating and count
- Tags: array of searchable tags

### Review
- Basic info: place, user, rating, title, content
- Visit details: visitDate, visitType, pricePaid, groupSize
- Aspects: detailed ratings for food, service, atmosphere, value
- Images: array of review images
- Helpful: count and users who marked as helpful
- Response: business owner response

## 🚀 Deployment

### Heroku
```bash
# Cài đặt Heroku CLI
# Tạo app
heroku create an-gi-o-dau-api

# Cấu hình environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main
```

### Vercel
```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🧪 Testing

```bash
# Chạy tests
npm test

# Test với coverage
npm run test:coverage
```

## 📝 API Documentation

Chi tiết API documentation có thể được tạo bằng Swagger/OpenAPI. File OpenAPI spec sẽ được thêm vào trong tương lai.

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ team phát triển.
