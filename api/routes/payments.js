const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Package = require('../models/Package');

// @route   POST /api/payments/checkout-details
// @desc    Get package details for checkout
// @access  Private
router.post('/checkout-details', authenticateToken, async (req, res) => {
  const { packageId } = req.body;

  if (!packageId) {
    return res.status(400).json({ success: false, message: 'Vui lòng chọn một gói.' });
  }

  try {
    const packageToBuy = await Package.findById(packageId);

    if (!packageToBuy || !packageToBuy.isActive) {
      return res.status(404).json({ success: false, message: 'Gói này không tồn tại hoặc không hoạt động.' });
    }

    // Just return the package details
    res.json({
      success: true,
      data: {
        package: packageToBuy
      }
    });

  } catch (error) {
    console.error('Get Checkout Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin thanh toán',
      error: error.message
    });
  }
});

module.exports = router;
