const express = require('express');
const router = express.Router();
const Itinerary = require('../models/Itinerary');
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

// @route   POST api/itineraries/ai-suggestion
// @desc    Generate itinerary suggestions using AI
// @access  Private
router.post('/ai-suggestion', auth, async (req, res) => {
    const { location, budget, interests, duration } = req.body;
    
    // In a real scenario, you would call the Gemini API here.
    // For this example, we'll simulate an AI response.
    console.log('Generating AI suggestion for:', req.body);

    // TODO: Build a more sophisticated suggestion logic
    const suggestion = {
        title: `A wonderful day in ${location}`,
        activities: [
            {
                startTime: "09:00",
                endTime: "11:00",
                activityType: "VISIT",
                customPlace: `A famous landmark in ${location}`,
                notes: "Start your day with some sightseeing."
            },
            {
                startTime: "12:00",
                endTime: "13:30",
                activityType: "EAT",
                customPlace: `A local restaurant known for great ${interests.includes('food') ? 'food' : 'dishes'}`,
                notes: "Enjoy a delicious lunch."
            },
            {
                startTime: "14:00",
                endTime: "16:00",
                activityType: "ENTERTAINMENT",
                customPlace: `An activity based on your interest in: ${interests.join(', ')}`,
                notes: "Have some fun!"
            }
        ]
    };

    res.json(suggestion);
});

module.exports = router;
