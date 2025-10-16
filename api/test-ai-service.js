require('dotenv').config();
const aiService = require('./services/ai');

async function testAiService() {
  console.log('Testing AI service...');
  
  const testPrompt = {
    location: 'Hòa Lạc',
    duration: 1,
    budget: 'MEDIUM',
    interests: ['Ẩm thực']
  };

  try {
    console.log('Sending prompt:', testPrompt);
    const result = await aiService.generateItinerarySuggestions(
      testPrompt.location, 
      testPrompt.duration, 
      testPrompt.budget, 
      testPrompt.interests.join(', ')
    );
    console.log('AI service result:', JSON.stringify(result, null, 2));
    console.log('✅ AI service test passed!');
  } catch (error) {
    console.error('❌ AI service test failed:', error.message);
    console.error('Full error:', error);
  }
}

testAiService();