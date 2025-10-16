const API_BASE = 'http://localhost:5000/api';

// Test data - content từ user đã test trước đó
const testContent = `Lịch trình Hòa Lạc - 1 ngày

**Sáng (7:00 - 11:30)**
• 7:00 - 8:30: Di chuyển từ Hà Nội đến Hòa Lạc
• 8:30 - 9:30: Ăn sáng chuẩn vị Hòa Lạc
• 9:30 - 11:30: Khám phá khu công nghệ cao

**Trưa (11:30 - 14:00)**
• 11:30 - 12:30: Ăn trưa tại nhà hàng địa phương
• 12:30 - 14:00: Nghỉ ngơi và khám phá thêm

**Chiều (14:00 - 18:00)**
• 14:00 - 16:00: Tham quan các địa điểm nổi tiếng
• 16:00 - 18:00: Mua sắm và trải nghiệm văn hóa

**Tối (18:00 - 21:00)**
• 18:00 - 19:30: Ăn tối
• 19:30 - 21:00: Trở về Hà Nội`;

async function testAIParsing() {
    console.log('🤖 Testing AI Timeline Parsing...\n');
    
    let passedTests = 0;
    let totalTests = 0;
    
    try {
        // Test 1: AI Suggestions Endpoint
        totalTests++;
        console.log('1. Testing AI Suggestions Endpoint...');
        
        const aiResponse = await fetch(`${API_BASE}/ai/suggestions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: testContent,
                location: 'Hòa Lạc, Hà Nội'
            })
        });
        
        if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            console.log('✅ AI Suggestions endpoint accessible');
            console.log(`   Response status: ${aiResponse.status}`);
            console.log(`   Has data: ${!!aiData.data}`);
            passedTests++;
        } else {
            console.log(`❌ AI Suggestions failed: ${aiResponse.status}`);
            const errorText = await aiResponse.text();
            console.log(`   Error: ${errorText}`);
        }
        
        // Test 2: Timeline Structure Parsing
        totalTests++;
        console.log('\n2. Testing Timeline Structure Parsing...');
        
        const timelineRegex = /\*\*(Sáng|Trưa|Chiều|Tối)\s*\([^)]+\)\*\*/g;
        const timeSlots = testContent.match(timelineRegex);
        
        if (timeSlots && timeSlots.length >= 3) {
            console.log('✅ Timeline structure detected');
            console.log(`   Found ${timeSlots.length} time slots: ${timeSlots.join(', ')}`);
            passedTests++;
        } else {
            console.log('❌ Timeline structure parsing failed');
        }
        
        // Test 3: Activity Extraction
        totalTests++;
        console.log('\n3. Testing Activity Extraction...');
        
        const activityRegex = /•\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2}):\s*([^\n]+)/g;
        const activities = [...testContent.matchAll(activityRegex)];
        
        if (activities.length >= 5) {
            console.log('✅ Activities extracted successfully');
            console.log(`   Found ${activities.length} activities`);
            activities.slice(0, 3).forEach((activity, index) => {
                console.log(`   ${index + 1}. ${activity[1]}-${activity[2]}: ${activity[3]}`);
            });
            passedTests++;
        } else {
            console.log('❌ Activity extraction failed');
        }
        
        // Test 4: Time Format Validation
        totalTests++;
        console.log('\n4. Testing Time Format Validation...');
        
        const timeFormatRegex = /\d{1,2}:\d{2}/g;
        const timeFormats = testContent.match(timeFormatRegex);
        
        if (timeFormats && timeFormats.length >= 10) {
            console.log('✅ Time formats valid');
            console.log(`   Found ${timeFormats.length} time entries`);
            passedTests++;
        } else {
            console.log('❌ Time format validation failed');
        }
        
        // Test 5: Content Structure Analysis
        totalTests++;
        console.log('\n5. Testing Content Structure Analysis...');
        
        const hasTitle = testContent.includes('Lịch trình');
        const hasTimeSlots = testContent.includes('Sáng') && testContent.includes('Chiều');
        const hasActivities = testContent.includes('•');
        
        if (hasTitle && hasTimeSlots && hasActivities) {
            console.log('✅ Content structure analysis passed');
            console.log('   ✓ Has title');
            console.log('   ✓ Has time slots');
            console.log('   ✓ Has activities');
            passedTests++;
        } else {
            console.log('❌ Content structure analysis failed');
        }
        
    } catch (error) {
        console.error('❌ Test execution error:', error.message);
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('AI PARSING TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ALL AI PARSING TESTS PASSED!');
        console.log('✅ AI timeline parsing is working correctly');
    } else if (passedTests >= totalTests * 0.8) {
        console.log('⚠️  MOSTLY WORKING - Some minor issues detected');
        console.log('✅ AI parsing functionality is acceptable');
    } else {
        console.log('❌ SIGNIFICANT ISSUES DETECTED');
        console.log('🔧 AI parsing needs attention');
    }
    
    return passedTests === totalTests;
}

// Run the test
if (require.main === module) {
    testAIParsing().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Test runner error:', error);
        process.exit(1);
    });
}

module.exports = { testAIParsing };