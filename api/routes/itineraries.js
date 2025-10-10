const express = require('express');
const router = express.Router();
const Itinerary = require('../models/Itinerary');
const User = require('../models/User');
const { authenticateToken: auth } = require('../middleware/auth');

// @route   GET api/itineraries
// @desc    Get all itineraries for the current user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const itineraries = await Itinerary.find({ user: req.user.id }).sort({ date: -1 });
        res.json(itineraries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/itineraries
// @desc    Create a new itinerary
// @access  Private
router.post('/', auth, async (req, res) => {
    const { title, date, description, status, activities } = req.body;
    try {
        const newItinerary = new Itinerary({
            user: req.user.id,
            title,
            date,
            description,
            status,
            activities
        });
        const itinerary = await newItinerary.save();
        res.status(201).json(itinerary);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/itineraries/:id
// @desc    Get a specific itinerary by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const itinerary = await Itinerary.findById(req.params.id).populate('activities.place');
        if (!itinerary) {
            return res.status(404).json({ msg: 'Itinerary not found' });
        }
        // Check if the user owns the itinerary
        if (itinerary.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        res.json(itinerary);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/itineraries/:id
// @desc    Update an itinerary (including its activities)
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { title, date, description, status, activities } = req.body;

    try {
        let itinerary = await Itinerary.findById(req.params.id);

        if (!itinerary) {
            return res.status(404).json({ msg: 'Itinerary not found' });
        }

        // Check if user owns the itinerary
        if (itinerary.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        itinerary = await Itinerary.findByIdAndUpdate(
            req.params.id,
            { $set: { title, date, description, status, activities } },
            { new: true }
        ).populate('activities.place');

        res.json(itinerary);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/itineraries/:id
// @desc    Delete an itinerary
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const itinerary = await Itinerary.findById(req.params.id);

        if (!itinerary) {
            return res.status(404).json({ msg: 'Itinerary not found' });
        }

        // Check if user owns the itinerary
        if (itinerary.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Itinerary.findByIdAndRemove(req.params.id);

        res.json({ msg: 'Itinerary removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const { getAiSuggestion } = require('../services/ai');

// @route   POST api/itineraries/ai-suggestion
// @desc    Generate itinerary suggestions using AI
// @access  Private
router.post('/ai-suggestion', auth, async (req, res) => {
    try {
        // 1. Fetch user with subscription plan
        const user = await User.findById(req.user.id).populate('subscriptionPlan');

        if (!user || !user.subscriptionPlan) {
            return res.status(403).json({ success: false, message: 'Bạn không có gói đăng ký đang hoạt động. Vui lòng đăng ký để sử dụng tính năng này.' });
        }

        // 2. Check if subscription is expired
        if (user.subscriptionEndDate && new Date() > user.subscriptionEndDate) {
            return res.status(403).json({ success: false, message: 'Gói của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục.' });
        }

        const plan = user.subscriptionPlan;

        // 3. Check usage limit (-1 means unlimited)
        if (plan.aiSuggestionLimit !== -1 && user.aiSuggestionsUsed >= plan.aiSuggestionLimit) {
            return res.status(403).json({ success: false, message: `Bạn đã đạt đến giới hạn ${plan.aiSuggestionLimit} gợi ý AI. Vui lòng nâng cấp gói của bạn.` });
        }

        // 4. Validate input
        const { location, duration, budget, interests } = req.body;
        if (!location || !duration || !budget || !Array.isArray(interests)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Đầu vào không hợp lệ. Vui lòng cung cấp địa điểm, thời gian, ngân sách và sở thích.' 
            });
        }

        // 5. If checks pass, proceed with AI suggestion logic
        console.log('Đang tạo gợi ý AI cho:', req.body);
        const suggestion = await getAiSuggestion(req.body);

        // Validate suggestion format from AI
        if (!suggestion || !suggestion.title || !Array.isArray(suggestion.activities)) {
            console.error('Lỗi định dạng gợi ý từ AI:', suggestion);
            return res.status(500).json({ success: false, message: 'AI đã trả về một định dạng gợi ý không hợp lệ.' });
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

    } catch (err) {
        // Catch any error from the process (DB, AI Service, etc.)
        console.error('Lỗi trong quá trình tạo gợi ý AI:', err);
        res.status(500).json({ 
            success: false, 
            // Send the actual error message from the service for better frontend debugging
            message: err.message || 'Không thể tạo gợi ý từ AI. Vui lòng thử lại sau.' 
        });
    }
});
module.exports = router;