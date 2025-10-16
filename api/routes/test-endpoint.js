const express = require('express');
const router = express.Router();
const aiService = require('../services/ai');

// Test basic connection
router.get('/', (req, res) => {
  res.send('Test route is working');
});

// Test AI connection
router.post('/test-ai', async (req, res) => {
  try {
    const testCases = [
      {
        name: "Basic test - Hà Nội",
        prompt: {
          location: 'Hà Nội',
          duration: 1,
          budget: 'MEDIUM',
          interests: ['Food']
        }
      },
      {
        name: "Special characters test",
        prompt: {
          location: 'Đà Lạt',
          duration: 2,
          budget: 'HIGH',
          interests: ['Nature', 'Culture']
        }
      },
      {
        name: "Multiple interests test",
        prompt: {
          location: 'Hội An',
          duration: 3,
          budget: 'LOW',
          interests: ['Food', 'Culture', 'Shopping']
        }
      }
    ];

    const results = [];
    for (const test of testCases) {
      console.log(`Running test: ${test.name}`);
      try {
        const result = await aiService.generateItinerarySuggestions(
          test.prompt.location, 
          test.prompt.duration, 
          test.prompt.budget, 
          test.prompt.interests.join(', '),
          'test-user-id'
        );
        results.push({
          name: test.name,
          success: true,
          data: result
        });
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      results: results
    });
  } catch (error) {
    console.error('Test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;