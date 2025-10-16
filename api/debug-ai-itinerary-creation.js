const axios = require('axios');

async function debugAiItineraryCreation() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'ngoquocan712@gmail.com',
      password: '123456'
    });

    console.log('📋 Login response:', loginResponse.data);
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }

    console.log('✅ Login successful');
    const token = loginResponse.data.token || loginResponse.data.data?.token;
    console.log('🔑 Token:', token ? 'exists' : 'missing');
    console.log('🔑 Token length:', token?.length || 0);

    // Step 1: Generate AI suggestion
    console.log('\n🤖 Step 1: Generating AI suggestion...');
    const aiResponse = await axios.post('http://localhost:5000/api/ai/itinerary-suggestions', {
      destination: 'Hòa Lạc Test',
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
    console.log('📋 AI Response:', {
      title: aiResponse.data.data.title,
      hasContent: !!aiResponse.data.data.content,
      contentLength: aiResponse.data.data.content?.length || 0
    });

    // Step 2: Create itinerary with AI data
    console.log('\n💾 Step 2: Creating itinerary with AI data...');
    const itineraryData = {
      title: aiResponse.data.data.title || 'Test AI Itinerary',
      date: new Date().toISOString(),
      description: aiResponse.data.data.description || 'Test description',
      aiContent: aiResponse.data.data.content,
      activities: [],
      isAiGenerated: true
    };

    console.log('📤 Sending itinerary data:', {
      title: itineraryData.title,
      isAiGenerated: itineraryData.isAiGenerated,
      hasAiContent: !!itineraryData.aiContent,
      aiContentPreview: itineraryData.aiContent ? itineraryData.aiContent.substring(0, 100) + '...' : 'No content'
    });

    const createResponse = await axios.post('http://localhost:5000/api/itineraries', itineraryData, {
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

    // Step 3: Fetch the created itinerary to verify
    console.log('\n🔍 Step 3: Fetching created itinerary to verify...');
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
      console.log('✅ Data consistency verified');
    } else {
      console.log('❌ Data inconsistency detected');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugAiItineraryCreation();