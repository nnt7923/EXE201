const express = require('express');
const router = express.Router();
const Itinerary = require('../models/Itinerary');
const User = require('../models/User');
const { authenticateToken: auth } = require('../middleware/auth');
const checkAiAccess = require('../middleware/checkAIAccess');
const aiService = require('../services/ai');

// @route   GET api/itineraries
// @desc    Get all itineraries for the current user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const itineraries = await Itinerary.find({ user: req.user._id, isActive: true }).sort({ date: -1 });
        res.json({ success: true, data: { itineraries } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST api/itineraries
// @desc    Create a new itinerary
// @access  Private
router.post('/', auth, async (req, res) => {
    console.log('🚀 API ENDPOINT HIT - Creating new itinerary');
    console.log('🔍 Full request body:', JSON.stringify(req.body, null, 2));
    console.log('📊 isAiGenerated - type:', typeof req.body.isAiGenerated, 'value:', req.body.isAiGenerated);
    console.log('📝 aiContent - type:', typeof req.body.aiContent, 'value:', req.body.aiContent ? 'HAS_CONTENT' : 'NULL/UNDEFINED');
    
    const { title, date, description, status, activities, isAiGenerated, aiContent } = req.body;
    
    try {
        const newItinerary = new Itinerary({
            user: req.user._id,
            title,
            date,
            description,
            status,
            activities,
            isAiGenerated: isAiGenerated || false,
            aiContent
        });
        const itinerary = await newItinerary.save();
        res.status(201).json({ success: true, data: { itinerary } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET api/itineraries/:id
// @desc    Get a specific itinerary by ID
// @access  Public (temporarily for testing)
router.get('/:id', async (req, res) => {
    try {
        const itinerary = await Itinerary.findOne({ _id: req.params.id, isActive: true }).populate('activities.place');
        if (!itinerary) {
            return res.status(404).json({ success: false, message: 'Itinerary not found' });
        }
        res.json({ success: true, data: { itinerary } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   PUT api/itineraries/:id
// @desc    Update an itinerary (including its activities)
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { title, date, description, status, activities } = req.body;

    try {
        let itinerary = await Itinerary.findById(req.params.id);

        if (!itinerary || !itinerary.isActive) {
            return res.status(404).json({ success: false, message: 'Itinerary not found' });
        }

        // Check if user owns the itinerary
        if (itinerary.user.toString() !== req.user._id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updatedItinerary = await Itinerary.findByIdAndUpdate(
            req.params.id,
            { $set: { title, date, description, status, activities } },
            { new: true }
        ).populate('activities.place');

        res.json({ success: true, data: { itinerary: updatedItinerary } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   DELETE api/itineraries/:id
// @desc    Delete an itinerary (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const itinerary = await Itinerary.findById(req.params.id);

        if (!itinerary || !itinerary.isActive) {
            return res.status(404).json({ success: false, message: 'Itinerary not found' });
        }

        // Check if user owns the itinerary
        if (itinerary.user.toString() !== req.user._id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        itinerary.isActive = false;
        await itinerary.save();

        res.json({ success: true, message: 'Itinerary removed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST api/itineraries/ai-suggestion
// @desc    Generate itinerary suggestions using AI
// @access  Private (requires active subscription with AI features)
router.post('/ai-suggestion', auth, checkAiAccess, async (req, res) => {
    try {
        // 1. Get user
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
        }

        // 2. Validate input
        const { location, duration, budget, interests } = req.body;
        if (!location || !duration || !budget || !Array.isArray(interests)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Đầu vào không hợp lệ. Vui lòng cung cấp địa điểm, thời gian, ngân sách và sở thích.' 
            });
        }

        // 5. If checks pass, proceed with AI suggestion logic
        console.log('Đang tạo gợi ý AI cho:', req.body);
        const suggestion = await aiService.generateItinerarySuggestions(location, duration, budget, interests.join(', '), req.user._id);

        // Validate suggestion format from AI
        if (!suggestion || !suggestion.title || !suggestion.content) {
            console.error('Lỗi định dạng gợi ý từ AI:', suggestion);
            return res.status(500).json({ success: false, message: 'AI đã trả về một định dạng gợi ý không hợp lệ.' });
        }

        res.json({ 
            success: true, 
            data: suggestion
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
