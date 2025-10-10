const express = require('express');
const router = express.Router();
const Itinerary = require('../models/Itinerary');
const User = require('../models/User');
const { authenticateToken: auth } = require('../middleware/auth');
const { getAiSuggestion } = require('../services/ai');

// @route   POST api/itineraries/ai-suggestion
// @desc    Generate itinerary suggestions using AI
// @access  Private
router.post('/ai-suggestion', auth, async (req, res) => {
    try {
        // 1. Fetch user with subscription plan
        const user = await User.findById(req.user.id).populate('subscriptionPlan');

        if (!user.subscriptionPlan) {
            return res.status(403).json({ 
                success: false, 
                message: 'Bạn cần có gói dịch vụ để sử dụng tính năng này.' 
            });
        }

        // 2. Check if subscription is expired
        if (user.subscriptionEndDate && new Date() > new Date(user.subscriptionEndDate)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Gói dịch vụ của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục.' 
            });
        }

        const plan = user.subscriptionPlan;

        // 3. Check usage limit (-1 means unlimited)
        if (plan.aiSuggestionLimit !== -1 && user.aiSuggestionsUsed >= plan.aiSuggestionLimit) {
            return res.status(403).json({ 
                success: false, 
                message: `Bạn đã sử dụng hết ${plan.aiSuggestionLimit} lượt gợi ý AI. Vui lòng nâng cấp gói dịch vụ.` 
            });
        }

        // 4. Validate input
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

            // 6. Increment usage counter if the plan is not unlimited
            if (plan.aiSuggestionLimit !== -1) {
                user.aiSuggestionsUsed += 1;
                await user.save();
            }

            res.json({ 
                success: true, 
                data: suggestion,
                remainingUsage: plan.aiSuggestionLimit === -1 ? 'Không giới hạn' : plan.aiSuggestionLimit - user.aiSuggestionsUsed
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