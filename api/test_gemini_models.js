const axios = require('axios');
require('dotenv').config();

const testGeminiModels = async () => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('🔑 API Key:', apiKey ? 'Found' : 'Not found');
    
    if (!apiKey) {
      console.log('❌ No GEMINI_API_KEY found in .env');
      return;
    }

    console.log('📋 Listing available Gemini models...');
    
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Available models:');
    response.data.models.forEach(model => {
      console.log(`- ${model.name}`);
      console.log(`  Display Name: ${model.displayName}`);
      console.log(`  Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testGeminiModels();