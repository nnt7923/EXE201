const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');

// @desc    Subscribe to a plan
// @route   POST /api/v1/subscriptions/subscribe
// @access  Private
router.post('/subscribe', auth, async (req, res) => {
  const { planId } = req.body;
  const userId = req.user.id;

  try {
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    // For now, we'll set the subscription to be valid for 30 days
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        subscriptionPlan: planId,
        aiSuggestionsUsed: 0, // Reset usage on new subscription
        subscriptionEndDate: subscriptionEndDate,
      },
      { new: true }
    ).populate('subscriptionPlan');

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET /api/subscriptions
// @desc    Get all user subscriptions (admin only)
// @access  Private (Admin)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    // Find all users who have a subscription plan
    const usersWithSubscriptions = await User.find({ subscriptionPlan: { $exists: true, $ne: null } })
      .populate('subscriptionPlan')
      .select('name email subscriptionEndDate createdAt')
      .sort('-subscriptionEndDate')
      .lean();

    res.status(200).json({ success: true, data: usersWithSubscriptions });
  } catch (error) {
    console.error('Error fetching all subscriptions:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;