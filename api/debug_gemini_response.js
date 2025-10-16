const axios = require('axios');
require('dotenv').config();

const debugGeminiResponse = async () => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('🔑 API Key:', apiKey ? 'Found' : 'Not found');
    
    if (!apiKey) {
      console.log('❌ No GEMINI_API_KEY found in .env');
      return;
    }

    console.log('🧪 Testing Gemini 2.5 Flash response structure...');
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: "Tạo một lịch trình du lịch 2 ngày tại Đà Nẵng với ngân sách 2000000 VND. Trả về dưới dạng JSON với các trường: title, description, content, totalEstimatedCost, tips."
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Response received!');
    console.log('📊 Full response structure:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n🔍 Checking response.data.candidates:');
    console.log('candidates exists:', !!response.data.candidates);
    console.log('candidates length:', response.data.candidates?.length);
    
    if (response.data.candidates && response.data.candidates[0]) {
      console.log('\n🔍 Checking candidates[0]:');
      console.log(JSON.stringify(response.data.candidates[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

debugGeminiResponse();