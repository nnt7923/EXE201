const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Place = require('../models/Place');
const { authenticateToken: auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware cho booking
const validateBooking = [
  body('place').isMongoId().withMessage('ID địa điểm không hợp lệ'),
  body('customerInfo.name').trim().notEmpty().withMessage('Tên khách hàng là bắt buộc'),
  body('customerInfo.email').isEmail().withMessage('Email không hợp lệ'),
  body('customerInfo.phone').matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ'),
  body('bookingDetails.checkInDate').isISO8601().withMessage('Ngày nhận phòng không hợp lệ'),
  body('bookingDetails.checkOutDate').isISO8601().withMessage('Ngày trả phòng không hợp lệ'),
  body('bookingDetails.numberOfGuests').isInt({ min: 1, max: 20 }).withMessage('Số lượng khách phải từ 1-20'),
  body('bookingDetails.numberOfRooms').isInt({ min: 1, max: 10 }).withMessage('Số lượng phòng phải từ 1-10'),
  body('pricing.roomPrice').isFloat({ min: 0 }).withMessage('Giá phòng phải >= 0'),
  body('pricing.totalAmount').isFloat({ min: 0 }).withMessage('Tổng tiền phải >= 0')
];

// @route   POST /api/bookings
// @desc    Tạo booking mới
// @access  Private
router.post('/', auth, ...validateBooking, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const {
      place,
      customerInfo,
      bookingDetails,
      pricing,
      paymentMethod,
      notes
    } = req.body;

    // Kiểm tra địa điểm có tồn tại
    const placeExists = await Place.findById(place);
    if (!placeExists) {
      return res.status(404).json({
        success: false,
        message: 'Địa điểm không tồn tại'
      });
    }

    // Kiểm tra ngày hợp lệ
    const checkIn = new Date(bookingDetails.checkInDate);
    const checkOut = new Date(bookingDetails.checkOutDate);
    
    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Ngày trả phòng phải sau ngày nhận phòng'
      });
    }

    if (checkIn < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Ngày nhận phòng không được trong quá khứ'
      });
    }

    // Tạo booking mới
    const booking = new Booking({
      user: req.user.id,
      place,
      customerInfo,
      bookingDetails,
      pricing,
      paymentMethod: paymentMethod || 'cash',
      notes: notes || {}
    });

    await booking.save();

    // Populate thông tin place và user
    await booking.populate([
      { path: 'place', select: 'name address images' },
      { path: 'user', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Đặt phòng thành công',
      data: booking
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo booking',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/user
// @desc    Lấy danh sách booking của user hiện tại
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const sort = req.query.sort || '-createdAt';

    // Tạo filter
    const filter = { user: req.user.id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('place', 'name description address images contact operatingHours')
      .populate('review')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết booking',
      error: error.message
    });
  }
});

// @route   GET /api/bookings
// @desc    Lấy danh sách booking của user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    // Tạo filter
    const filter = { user: req.user.id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Lấy bookings với pagination
    const bookings = await Booking.find(filter)
      .populate('place', 'name address images rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách booking',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Lấy chi tiết booking
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('place', 'name description address images contact operatingHours')
      .populate('user', 'name email')
      .populate('review');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // Kiểm tra quyền truy cập
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập booking này'
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết booking',
      error: error.message
    });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Cập nhật booking
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // Kiểm tra quyền truy cập
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật booking này'
      });
    }

    // Chỉ cho phép cập nhật một số trường nhất định
    const allowedUpdates = ['customerInfo', 'bookingDetails', 'notes.customerNotes'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'notes.customerNotes') {
          updates['notes.customerNotes'] = req.body.notes?.customerNotes;
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    // Admin có thể cập nhật thêm các trường khác
    if (req.user.role === 'admin') {
      const adminFields = ['status', 'paymentStatus', 'notes.adminNotes'];
      adminFields.forEach(field => {
        if (req.body[field] !== undefined) {
          if (field === 'notes.adminNotes') {
            updates['notes.adminNotes'] = req.body.notes?.adminNotes;
          } else {
            updates[field] = req.body[field];
          }
        }
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate([
      { path: 'place', select: 'name address images' },
      { path: 'user', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Cập nhật booking thành công',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật booking',
      error: error.message
    });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Hủy booking
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // Kiểm tra quyền truy cập
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền hủy booking này'
      });
    }

    // Kiểm tra trạng thái có thể hủy
    if (['checked-in', 'checked-out', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy booking ở trạng thái này'
      });
    }

    // Cập nhật trạng thái thành cancelled
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: req.user.id,
      reason: req.body.reason || 'Hủy bởi khách hàng'
    };

    await booking.save();

    res.json({
      success: true,
      message: 'Hủy booking thành công',
      data: booking
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi hủy booking',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/place/:placeId
// @desc    Lấy danh sách booking của một địa điểm (cho owner/admin)
// @access  Private (Owner/Admin)
router.get('/place/:placeId', auth, async (req, res) => {
  try {
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = { place: req.params.placeId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching place bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách booking',
      error: error.message
    });
  }
});

module.exports = router;