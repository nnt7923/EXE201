const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');

// @desc    Subscribe to a plan
// @route   POST /api/subscriptions/subscribe
// @access  Private
router.post('/subscribe', auth, async (req, res) => {
  const { planId } = req.body;
  const userId = req.user.id;

  try {
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, message: 'Plan not found or is not active' });
    }

    // Set the subscription end date based on the plan's duration
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + plan.durationInDays);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        subscriptionPlan: planId,
        aiSuggestionsUsed: 0, // Reset usage on new subscription
        subscriptionEndDate: subscriptionEndDate,
      },
      { new: true }
    ).populate('subscriptionPlan');

    res.status(200).json({ success: true, data: { user: updatedUser } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
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
      .select('name email subscriptionPlan subscriptionEndDate createdAt')
      .sort('-subscriptionEndDate')
      .lean();

    res.status(200).json({ success: true, data: { subscriptions: usersWithSubscriptions } });
  } catch (error) {
    console.error('Error fetching all subscriptions:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
