const { GoogleGenerativeAI } = require('@google/generative-ai');
const AISuggestion = require('../models/AISuggestion');
const crypto = require('crypto');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
  }

  // Tạo hash key cho cache
  createCacheKey(data) {
    const dataString = JSON.stringify(data);
    return crypto.createHash('md5').update(dataString).digest('hex');
  }

  async generateItinerarySuggestions(destination, duration, budget, preferences, userId = null) {
    try {
      // Tạo cache key từ input data
      const inputData = { 
        destination, 
        duration, 
        budget, 
        preferences: Array.isArray(preferences) ? preferences.join(', ') : preferences 
      };
      const cacheKey = this.createCacheKey(inputData);
      
      // Kiểm tra cache trong MongoDB Atlas
      console.log('🔍 Checking cache for itinerary suggestion...');
      const cachedSuggestion = await AISuggestion.findCachedSuggestion('itinerary', cacheKey);
      
      if (cachedSuggestion) {
        console.log('✅ Found cached itinerary suggestion');
        await cachedSuggestion.updateUsage();
        return cachedSuggestion.aiResponse;
      }

      console.log('🆕 Generating new itinerary suggestion...');
      
      // Nếu không có API key, trả về mock data
      if (!this.apiKey || this.apiKey === 'undefined') {
        console.log('🤖 Using mock AI data (no API key)');
        const mockResponse = {
          title: `Lịch trình ${destination} - ${duration} ngày`,
          description: `Khám phá ${destination} trong ${duration} ngày với ngân sách ${budget.toLocaleString()} VND`,
          content: `
**Ngày 1:**
- 08:00 - 10:00: Tham quan trung tâm thành phố
- 10:30 - 12:00: Khám phá các điểm du lịch nổi tiếng  
- 12:00 - 13:30: Ăn trưa tại nhà hàng địa phương
- 14:00 - 16:00: Tham quan bảo tàng
- 16:30 - 18:00: Dạo phố và chụp ảnh
- 19:00: Thưởng thức ẩm thực địa phương

**Ngày 2:**
- 08:30 - 10:30: Tham quan di tích lịch sử
- 11:00 - 12:30: Mua sắm tại chợ địa phương
- 12:30 - 14:00: Ăn trưa và nghỉ ngơi
- 14:30 - 17:00: Khám phá khu vực xung quanh
- 17:30 - 19:00: Dạo phố buổi chiều
- 19:30: Ăn tối và kết thúc chuyến đi

**Chi phí ước tính:**
- Ăn uống: ${Math.round(budget * 0.4).toLocaleString()} VND
- Di chuyển: ${Math.round(budget * 0.3).toLocaleString()} VND
- Tham quan: ${Math.round(budget * 0.3).toLocaleString()} VND
          `,
          totalEstimatedCost: budget,
          tips: [
            'Mang theo giấy tờ tùy thân',
            'Kiểm tra thời tiết trước khi đi',
            'Chuẩn bị tiền mặt cho các chi phí nhỏ',
            'Tìm hiểu văn hóa địa phương'
          ]
        };
        
        // Lưu mock data vào MongoDB Atlas
        await AISuggestion.createOrUpdateSuggestion({
          requestType: 'itinerary',
          inputHash: cacheKey,
          inputData,
          aiResponse: mockResponse,
          userId
        });
        
        return mockResponse;
      }

      const prompt = `Tạo một lịch trình du lịch chi tiết cho ${destination} trong ${duration} ngày với ngân sách ${budget} VND. 
      Sở thích: ${preferences || 'Không có sở thích đặc biệt'}.
      
      QUAN TRỌNG: Content phải có format timeline với thời gian cụ thể để hiển thị đẹp trên giao diện. 
      Sử dụng format sau cho mỗi hoạt động:
      - "HH:MM - HH:MM: Tên hoạt động tại Địa điểm"
      - "HH:MM: Hoạt động ngắn"
      
      Ví dụ format:
      **Ngày 1:**
      - 08:00 - 10:00: Tham quan Chùa Một Cột
      - 10:30 - 12:00: Khám phá Phố cổ Hà Nội
      - 12:00 - 13:30: Ăn trưa tại Quán Phở Thìn
      - 14:00 - 16:00: Tham quan Văn Miếu
      - 16:30 - 18:00: Dạo quanh Hồ Hoàn Kiếm
      - 19:00: Ăn tối và nghỉ ngơi
      
      Trả về dưới dạng JSON với cấu trúc sau:
      {
        "title": "Tiêu đề lịch trình",
        "description": "Mô tả ngắn gọn",
        "content": "Nội dung chi tiết theo từng ngày với timeline cụ thể (markdown format)",
        "totalEstimatedCost": số tiền ước tính,
        "tips": ["mẹo 1", "mẹo 2", "mẹo 3"]
      }`;

      const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // Retry logic for API overload
      let result;
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 2000; // 2 seconds
      
      while (retryCount < maxRetries) {
        try {
          result = await model.generateContent(prompt);
          break; // Success, exit retry loop
        } catch (apiError) {
          retryCount++;
          console.log(`🔄 Gemini API attempt ${retryCount}/${maxRetries} failed:`, apiError.message);
          
          if (apiError.message.includes('overloaded') || apiError.message.includes('503')) {
            if (retryCount < maxRetries) {
              console.log(`⏳ Waiting ${retryDelay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              continue;
            }
          }
          throw apiError; // Re-throw if not overload error or max retries reached
        }
      }
      
      const aiResponse = result.response.text();
      
      let finalResponse;
      
      // Thử parse JSON từ response
      try {
        // Tìm JSON block đầu tiên và cuối cùng
        let jsonText = aiResponse;
        
        // Nếu có ```json hoặc ``` wrapper, extract nội dung
        const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          jsonText = codeBlockMatch[1];
        } else {
          // Tìm JSON object đầu tiên
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonText = jsonMatch[0];
          }
        }
        
        // Clean up common JSON issues
        jsonText = jsonText
          .replace(/,\s*}/g, '}')  // Remove trailing commas
          .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
          .trim();
        
        finalResponse = JSON.parse(jsonText);
        
        // Validate required fields
        if (!finalResponse.title || !finalResponse.content) {
          throw new Error('Missing required fields in AI response');
        }
        
      } catch (parseError) {
        console.log('Không thể parse JSON, trả về text thuần:', parseError.message);
        console.log('Raw AI response:', aiResponse.substring(0, 500) + '...');
        
        // Nếu không parse được JSON, trả về format đơn giản với timeline mock
        finalResponse = {
          title: `Lịch trình ${destination} - ${duration} ngày`,
          description: `Khám phá ${destination} trong ${duration} ngày với ngân sách ${budget.toLocaleString()} VND`,
          content: `
**Ngày 1:**
- 08:00 - 10:00: Tham quan trung tâm ${destination}
- 10:30 - 12:00: Khám phá các điểm du lịch nổi tiếng  
- 12:00 - 13:30: Ăn trưa tại nhà hàng địa phương
- 14:00 - 16:00: Tham quan bảo tàng
- 16:30 - 18:00: Dạo phố và chụp ảnh
- 19:00: Thưởng thức ẩm thực địa phương

**Chi phí ước tính:**
- Ăn uống: ${Math.round(budget * 0.4).toLocaleString()} VND
- Di chuyển: ${Math.round(budget * 0.3).toLocaleString()} VND
- Tham quan: ${Math.round(budget * 0.3).toLocaleString()} VND
          `,
          totalEstimatedCost: budget,
          tips: ['Mang theo giấy tờ tùy thân', 'Kiểm tra thời tiết trước khi đi']
        };
      }

      // Lưu kết quả vào MongoDB Atlas
      console.log('💾 Saving AI response to MongoDB Atlas...');
      await AISuggestion.createOrUpdateSuggestion({
        requestType: 'itinerary',
        inputHash: cacheKey,
        inputData,
        aiResponse: finalResponse,
        userId
      });

      return finalResponse;

    } catch (error) {
      console.error('Lỗi gọi API Gemini:', error.message);
      throw new Error('Không thể tạo gợi ý lịch trình. Vui lòng thử lại sau.');
    }
  }

  async generatePlaceSuggestions(query, userId = null) {
    try {
      // Tạo cache key từ input data
      const inputData = { query };
      const cacheKey = this.createCacheKey(inputData);
      
      // Kiểm tra cache trong MongoDB Atlas
      console.log('🔍 Checking cache for place suggestion...');
      const cachedSuggestion = await AISuggestion.findCachedSuggestion('place', cacheKey);
      
      if (cachedSuggestion) {
        console.log('✅ Found cached place suggestion');
        await cachedSuggestion.updateUsage();
        return cachedSuggestion.aiResponse;
      }

      console.log('🆕 Generating new place suggestion...');
      
      // Nếu không có API key, trả về mock data
      if (!this.apiKey) {
        console.log('🤖 Using mock AI data for places (no API key)');
        const mockResponse = {
          suggestions: [
            {
              name: `Địa điểm nổi tiếng tại ${query}`,
              location: query,
              description: `Một trong những điểm đến hấp dẫn nhất khi tìm kiếm về ${query}`,
              highlights: [
                "Kiến trúc độc đáo",
                "Phong cảnh đẹp",
                "Ẩm thực địa phương"
              ],
              bestTime: "Quanh năm",
              estimatedCost: "500,000 - 1,000,000 VND"
            },
            {
              name: `Khu vực văn hóa ${query}`,
              location: query,
              description: `Nơi lưu giữ những nét văn hóa truyền thống của ${query}`,
              highlights: [
                "Lịch sử phong phú",
                "Trải nghiệm văn hóa",
                "Chụp ảnh đẹp"
              ],
              bestTime: "Sáng sớm hoặc chiều mát",
              estimatedCost: "200,000 - 500,000 VND"
            }
          ]
        };
        
        // Lưu mock data vào MongoDB Atlas
        try {
          await AISuggestion.createOrUpdateSuggestion({
            requestType: 'place',
            inputHash: cacheKey,
            inputData,
            aiResponse: mockResponse,
            userId
          });
        } catch (cacheError) {
          console.log('⚠️ Warning: Could not save to cache:', cacheError.message);
        }
        
        return mockResponse;
      }

      const prompt = `Gợi ý 5 địa điểm du lịch tại Việt Nam phù hợp với: "${query}"

Hãy đưa ra danh sách các địa điểm với thông tin:
1. Tên địa điểm
2. Mô tả ngắn
3. Loại hình du lịch
4. Vị trí
5. Thời gian tham quan gợi ý

Trả lời bằng tiếng Việt và định dạng JSON với cấu trúc:
{
  "suggestions": [
    {
      "name": "Tên địa điểm",
      "description": "Mô tả",
      "type": "Loại hình",
      "location": "Vị trí",
      "duration": "Thời gian gợi ý",
      "highlights": ["Điểm nổi bật 1", "Điểm nổi bật 2"]
    }
  ]
}`;

      const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // Retry logic for API overload
      let result;
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 2000; // 2 seconds
      
      while (retryCount < maxRetries) {
        try {
          result = await model.generateContent(`Bạn là một chuyên gia du lịch Việt Nam, giúp gợi ý các địa điểm du lịch phù hợp.\n\n${prompt}`);
          break; // Success, exit retry loop
        } catch (apiError) {
          retryCount++;
          console.log(`🔄 Gemini API attempt ${retryCount}/${maxRetries} failed:`, apiError.message);
          
          if (apiError.message.includes('overloaded') || apiError.message.includes('503')) {
            if (retryCount < maxRetries) {
              console.log(`⏳ Waiting ${retryDelay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              continue;
            }
          }
          throw apiError; // Re-throw if not overload error or max retries reached
        }
      }
      
      const aiResponse = result.response.text();
      
      let finalResponse;
      
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          finalResponse = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.log('Không thể parse JSON:', parseError);
        finalResponse = {
          suggestions: [{
            name: 'Gợi ý từ AI',
            location: 'Việt Nam',
            description: aiResponse,
            highlights: [],
            bestTime: 'Quanh năm',
            estimatedCost: 'Liên hệ'
          }]
        };
      }

      // Lưu kết quả vào MongoDB Atlas
      console.log('💾 Saving place suggestion to MongoDB Atlas...');
      try {
        await AISuggestion.createOrUpdateSuggestion({
          requestType: 'place',
          inputHash: cacheKey,
          inputData,
          aiResponse: finalResponse,
          userId
        });
      } catch (cacheError) {
        console.log('⚠️ Warning: Could not save to cache:', cacheError.message);
      }

      return finalResponse;

    } catch (error) {
      console.error('Lỗi gọi API Gemini:', error.message);
      throw new Error('Không thể tạo gợi ý địa điểm. Vui lòng thử lại sau.');
    }
  }
}

module.exports = new AIService();