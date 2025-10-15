const User = require('../models/User');

/**
 * Middleware to check if user has access to AI features
 * Requires user to have confirmed payment and active subscription
 */
const checkAIAccess = async (req, res, next) => {
  try {
    // Get user with subscription details
    const user = await User.findById(req.user.id)
      .populate('subscriptionPlan')
      .populate('currentPayment');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    // Check subscription expiry first
    await user.checkSubscriptionExpiry();

    // Check if user can access AI features
    if (!user.canAccessAI()) {
      let message = 'Bạn cần đăng ký gói dịch vụ để sử dụng tính năng AI';
      
      if (user.subscriptionStatus === 'pending_payment') {
        message = 'Thanh toán của bạn đang chờ xác nhận. Vui lòng chờ admin xác nhận để sử dụng tính năng AI.';
      } else if (user.subscriptionStatus === 'expired') {
        message = 'Gói đăng ký của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng tính năng AI.';
      } else if (user.paymentStatus === 'rejected') {
        message = 'Thanh toán của bạn đã bị từ chối. Vui lòng thực hiện thanh toán lại.';
      }

      return res.status(403).json({
        success: false,
        message,
        data: {
          subscriptionStatus: user.subscriptionStatus,
          paymentStatus: user.paymentStatus,
          subscriptionEndDate: user.subscriptionEndDate,
          currentPayment: user.currentPayment
        }
      });
    }

    // Check if user has remaining AI suggestions
    if (!user.hasAISuggestionsLeft()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn đã sử dụng hết số lượt gợi ý AI trong tháng này',
        data: {
          aiSuggestionsUsed: user.aiSuggestionsUsed,
          aiSuggestionsLimit: user.aiSuggestionsLimit,
          subscriptionPlan: user.subscriptionPlan
        }
      });
    }

    // Add user info to request for use in route handlers
    req.userWithSubscription = user;
    next();

  } catch (error) {
    console.error('AI access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra quyền truy cập AI'
    });
  }
};

/**
 * Middleware to check if user has basic subscription (any confirmed payment)
 * Less strict than checkAIAccess - just checks if payment is confirmed
 */
const checkSubscriptionAccess = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('subscriptionPlan');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    // Check subscription expiry
    await user.checkSubscriptionExpiry();

    // Check if user has any active subscription
    if (user.subscriptionStatus !== 'active' || user.paymentStatus !== 'confirmed') {
      return res.status(403).json({
        success: false,
        message: 'Bạn cần có gói đăng ký đã được xác nhận để truy cập tính năng này',
        data: {
          subscriptionStatus: user.subscriptionStatus,
          paymentStatus: user.paymentStatus
        }
      });
    }

    req.userWithSubscription = user;
    next();

  } catch (error) {
    console.error('Subscription access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra quyền truy cập'
    });
  }
};

/**
 * Middleware to increment AI usage counter after successful AI request
 */
const incrementAIUsage = async (req, res, next) => {
  try {
    if (req.userWithSubscription) {
      await req.userWithSubscription.useAISuggestion();
    }
    next();
  } catch (error) {
    console.error('AI usage increment error:', error);
    // Don't fail the request if usage increment fails
    next();
  }
};

module.exports = {
  checkAIAccess,
  checkSubscriptionAccess,
  incrementAIUsage
};