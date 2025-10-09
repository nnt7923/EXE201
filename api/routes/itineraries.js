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

        if (!user.subscriptionPlan) {
            return res.status(403).json({ success: false, message: 'You do not have an active subscription. Please subscribe to a plan to use this feature.' });
        }

        // 2. Check if subscription is expired
        if (user.subscriptionEndDate && new Date() > user.subscriptionEndDate) {
            return res.status(403).json({ success: false, message: 'Your subscription has expired. Please renew to continue.' });
        }

        const plan = user.subscriptionPlan;

        // 3. Check usage limit
        // -1 means unlimited
        if (plan.aiSuggestionLimit !== -1 && user.aiSuggestionsUsed >= plan.aiSuggestionLimit) {
            return res.status(403).json({ success: false, message: `You have reached your limit of ${plan.aiSuggestionLimit} AI suggestions. Please upgrade your plan.` });
        }

        // 4. If checks pass, proceed with AI suggestion logic
        console.log('Generating AI suggestion for:', req.body);
        const suggestion = await getAiSuggestion(req.body);

        // 5. Increment usage counter if the plan is not unlimited
        if (plan.aiSuggestionLimit !== -1) {
            user.aiSuggestionsUsed += 1;
            await user.save();
        }

        res.json({ success: true, data: suggestion });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Failed to generate AI suggestion.' });
    }
});

module.exports = router;
