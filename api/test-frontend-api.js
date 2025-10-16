const axios = require('axios');

async function testFrontendApiCall() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'ngoquocan712@gmail.com',
      password: '123456'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }

    console.log('✅ Login successful');
    const token = loginResponse.data.token || loginResponse.data.data?.token;

    // Step 1: Generate AI suggestion (giống như frontend)
    console.log('\n🤖 Step 1: Generating AI suggestion...');
    const aiResponse = await axios.post('http://localhost:5000/api/ai/itinerary-suggestions', {
      destination: 'Hòa Lạc Frontend Test',
      duration: 1,
      budget: 'MEDIUM',
      interests: ['Ẩm thực']
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!aiResponse.data.success) {
      console.log('❌ AI suggestion failed:', aiResponse.data);
      return;
    }

    console.log('✅ AI suggestion generated');
    const suggestion = aiResponse.data.data;

    // Step 2: Create itinerary (giống như frontend)
    console.log('\n💾 Step 2: Creating itinerary (Frontend style)...');
    
    // Simulate frontend data structure
    const frontendItineraryData = {
      title: suggestion.title || 'Frontend Test Itinerary',
      date: new Date().toISOString(),
      description: suggestion.description || 'Test description from frontend',
      aiContent: suggestion.content, // Giống frontend
      activities: [], // Giống frontend (empty array)
      isAiGenerated: true // Giống frontend
    };

    console.log('📤 Sending frontend-style data:', {
      title: frontendItineraryData.title,
      isAiGenerated: frontendItineraryData.isAiGenerated,
      hasAiContent: !!frontendItineraryData.aiContent,
      aiContentLength: frontendItineraryData.aiContent?.length || 0,
      activitiesCount: frontendItineraryData.activities.length
    });

    const createResponse = await axios.post('http://localhost:5000/api/itineraries', frontendItineraryData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!createResponse.data.success) {
      console.log('❌ Itinerary creation failed:', createResponse.data);
      return;
    }

    console.log('✅ Itinerary created successfully');
    const createdItinerary = createResponse.data.data.itinerary;
    console.log('📊 Created itinerary:', {
      _id: createdItinerary._id,
      title: createdItinerary.title,
      isAiGenerated: createdItinerary.isAiGenerated,
      hasAiContent: !!createdItinerary.aiContent,
      aiContentLength: createdItinerary.aiContent?.length || 0
    });

    // Step 3: Verify by fetching
    console.log('\n🔍 Step 3: Fetching to verify...');
    const fetchResponse = await axios.get(`http://localhost:5000/api/itineraries/${createdItinerary._id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!fetchResponse.data.success) {
      console.log('❌ Fetch failed:', fetchResponse.data);
      return;
    }

    const fetchedItinerary = fetchResponse.data.data.itinerary;
    console.log('📊 Fetched itinerary:', {
      _id: fetchedItinerary._id,
      title: fetchedItinerary.title,
      isAiGenerated: fetchedItinerary.isAiGenerated,
      hasAiContent: !!fetchedItinerary.aiContent,
      aiContentLength: fetchedItinerary.aiContent?.length || 0
    });

    // Compare
    console.log('\n🔍 Comparison:');
    console.log('- Created isAiGenerated:', createdItinerary.isAiGenerated);
    console.log('- Fetched isAiGenerated:', fetchedItinerary.isAiGenerated);
    console.log('- Created aiContent length:', createdItinerary.aiContent?.length || 0);
    console.log('- Fetched aiContent length:', fetchedItinerary.aiContent?.length || 0);

    if (createdItinerary.isAiGenerated === fetchedItinerary.isAiGenerated && 
        createdItinerary.aiContent === fetchedItinerary.aiContent) {
      console.log('✅ Frontend-style API call works correctly!');
    } else {
      console.log('❌ Data inconsistency detected');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFrontendApiCall();