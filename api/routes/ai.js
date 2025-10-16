const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const checkAiAccess = require('../middleware/checkaiaccess');
const aiService = require('../services/ai');

// Route tạo gợi ý lịch trình
router.post('/itinerary-suggestions', authenticateToken, checkAiAccess, async (req, res) => {
  try {
    const { destination, duration, budget, interests } = req.body;

    // Validate input
    if (!destination || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp điểm đến và thời gian du lịch.'
      });
    }

    const preferences = {
      destination,
      duration: parseInt(duration),
      budget: budget || 'Không giới hạn',
      interests: interests || []
    };

    const suggestions = await aiService.generateItinerarySuggestions(
      preferences.destination,
      preferences.duration,
      preferences.budget,
      preferences.interests,
      req.user.id
    );

    // Increment AI usage count after successful generation
    console.log('🔢 Incrementing AI usage count for user:', req.user.id);
    await req.subscription.updateOne({ $inc: { aiUsageCount: 1 } });
    console.log('✅ AI usage count incremented successfully');
    
    const updatedRemainingUsage = req.remainingAiUsage - 1;

    res.json({
      success: true,
      data: suggestions,
      message: 'Tạo gợi ý lịch trình thành công.',
      aiLimit: req.aiLimit,
      remainingUsage: updatedRemainingUsage,
      subscription: {
        plan: req.subscription.plan.name,
        endDate: req.subscription.endDate
      }
    });

  } catch (error) {
    console.error('Lỗi tạo gợi ý lịch trình:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi tạo gợi ý lịch trình.'
    });
  }
});

// Route tạo gợi ý địa điểm
router.post('/place-suggestions', authenticateToken, checkAiAccess, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp từ khóa tìm kiếm.'
      });
    }

    const suggestions = await aiService.generatePlaceSuggestions(query, req.user.id);

    // Increment AI usage count after successful generation
    await req.subscription.updateOne({ $inc: { aiUsageCount: 1 } });
    
    const updatedRemainingUsage = req.remainingAiUsage - 1;

    res.json({
      success: true,
      data: suggestions,
      message: 'Tạo gợi ý địa điểm thành công.',
      aiLimit: req.aiLimit,
      remainingUsage: updatedRemainingUsage,
      subscription: {
        plan: req.subscription.plan.name,
        endDate: req.subscription.endDate
      }
    });

  } catch (error) {
    console.error('Lỗi tạo gợi ý địa điểm:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi tạo gợi ý địa điểm.'
    });
  }
});

// Route kiểm tra quyền truy cập AI
router.get('/check-access', authenticateToken, checkAiAccess, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        hasAccess: true,
        aiLimit: req.aiLimit,
        aiUsageCount: req.subscription.aiUsageCount || 0,
        remainingUsage: req.remainingAiUsage,
        subscription: {
          plan: req.subscription.plan.name,
          endDate: req.subscription.endDate,
          status: req.subscription.status
        }
      },
      message: 'Bạn có quyền sử dụng tính năng AI.'
    });
  } catch (error) {
    console.error('Lỗi kiểm tra quyền AI:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi kiểm tra quyền truy cập.'
    });
  }
});

module.exports = router;