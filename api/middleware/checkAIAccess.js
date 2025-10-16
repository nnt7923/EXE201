const Subscription = require('../models/Subscription');

const checkAiAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Tìm subscription active, đã thanh toán và chưa hết hạn
    const subscription = await Subscription.findOne({
      user: userId,
      status: 'active',
      paymentStatus: 'paid',
      endDate: { $gt: new Date() }
    }).populate('plan');

    // Kiểm tra có subscription không
    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Bạn cần có gói đăng ký để sử dụng tính năng AI.',
        code: 'NO_SUBSCRIPTION'
      });
    }

    // Kiểm tra có plan không
    if (!subscription.plan) {
      return res.status(403).json({
        success: false,
        message: 'Gói đăng ký của bạn không hợp lệ.',
        code: 'INVALID_PLAN'
      });
    }

    // Kiểm tra plan có hỗ trợ AI không
    if (!subscription.plan.aiSuggestionLimit || subscription.plan.aiSuggestionLimit <= 0) {
      return res.status(403).json({
        success: false,
        message: 'Gói đăng ký của bạn không hỗ trợ tính năng AI.',
        code: 'AI_NOT_SUPPORTED'
      });
    }

    // Kiểm tra số lượt AI còn lại
    const remainingUsage = subscription.plan.aiSuggestionLimit - (subscription.aiUsageCount || 0);
    if (remainingUsage <= 0) {
      return res.status(403).json({
        success: false,
        message: 'Bạn đã sử dụng hết lượt gợi ý AI trong gói đăng ký hiện tại.',
        code: 'AI_LIMIT_EXCEEDED'
      });
    }

    // Gắn thông tin subscription vào request
    req.subscription = subscription;
    req.aiLimit = subscription.plan.aiSuggestionLimit;
    req.remainingAiUsage = remainingUsage;

    next();
  } catch (error) {
    console.error('Lỗi kiểm tra quyền truy cập AI:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống.',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = checkAiAccess;