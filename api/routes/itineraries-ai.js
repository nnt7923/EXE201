const express = require('express');
const router = express.Router();
const Itinerary = require('../models/Itinerary');
const User = require('../models/User');
const { authenticateToken: auth } = require('../middleware/auth');
const { checkAIAccess, incrementAIUsage } = require('../middleware/checkAIAccess');
const { getAiSuggestion } = require('../services/ai');

// @route   POST api/itineraries/ai-suggestion
// @desc    Generate itinerary suggestions using AI
// @access  Private (requires confirmed payment)
router.post('/ai-suggestion', auth, checkAIAccess, async (req, res) => {
    try {
        // User access already validated by middleware
        const user = req.userWithSubscription;

        // Validate input
        const { location, duration, budget, interests } = req.body;
        if (!location || !duration || !budget || !Array.isArray(interests)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cung cấp đầy đủ thông tin: địa điểm, thời gian, ngân sách và sở thích.' 
            });
        }

        // 5. Generate AI suggestion
        console.log('Đang tạo gợi ý AI cho:', { location, duration, budget, interests });
        try {
            const suggestion = await getAiSuggestion(req.body);
            
            // Validate suggestion format
            if (!suggestion || !suggestion.title || !Array.isArray(suggestion.activities)) {
                throw new Error('Định dạng gợi ý không hợp lệ');
            }

            // 6. Increment usage counter
            await user.useAISuggestion();

            res.json({ 
                success: true, 
                data: suggestion,
                usage: {
                    used: user.aiSuggestionsUsed,
                    limit: user.aiSuggestionsLimit,
                    remaining: user.aiSuggestionsLimit === -1 ? 'Không giới hạn' : user.aiSuggestionsLimit - user.aiSuggestionsUsed
                }
            });

        } catch (aiError) {
            console.error('Lỗi khi tạo gợi ý AI:', aiError);
            res.status(500).json({
                success: false,
                message: aiError.message || 'Không thể tạo gợi ý từ AI. Vui lòng thử lại sau.'
            });
            return;
        }

    } catch (err) {
        console.error('Lỗi server:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message || 'Đã xảy ra lỗi khi tạo gợi ý AI.' 
        });
    }
});

module.exports = router;