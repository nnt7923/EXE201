const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên phải có từ 2-50 ký tự'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại phải có 10-11 chữ số'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc'),
  handleValidationErrors
];

// Place validation rules
const validatePlace = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên địa điểm phải có từ 2-100 ký tự'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Mô tả phải có từ 10-1000 ký tự'),
  body('category')
    .isIn(['restaurant', 'cafe', 'accommodation', 'entertainment', 'study'])
    .withMessage('Danh mục không hợp lệ'),
  body('subcategory')
    .trim()
    .notEmpty()
    .withMessage('Danh mục con là bắt buộc'),
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Địa chỉ đường là bắt buộc'),
  body('address.ward')
    .trim()
    .notEmpty()
    .withMessage('Phường/xã là bắt buộc'),
  body('address.district')
    .trim()
    .notEmpty()
    .withMessage('Quận/huyện là bắt buộc'),
  body('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Vĩ độ phải từ -90 đến 90'),
  body('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Kinh độ phải từ -180 đến 180'),
  body('pricing.minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá tối thiểu không được âm'),
  body('pricing.maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá tối đa không được âm')
    .custom((value, { req }) => {
      if (value !== undefined && req.body.pricing.minPrice !== undefined) {
        if (parseFloat(value) < parseFloat(req.body.pricing.minPrice)) {
          throw new Error('Giá tối đa phải lớn hơn hoặc bằng giá tối thiểu');
        }
      }
      return true;
    }),
  handleValidationErrors
];

// Review validation rules
const validateReview = [
  body('place')
    .isMongoId()
    .withMessage('ID địa điểm không hợp lệ'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Đánh giá phải từ 1-5 sao'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Tiêu đề phải có từ 5-100 ký tự'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Nội dung phải có từ 10-1000 ký tự'),
  body('visitDate')
    .isISO8601()
    .withMessage('Ngày ghé thăm không hợp lệ'),
  body('visitType')
    .optional()
    .isIn(['dine-in', 'takeaway', 'delivery', 'drive-through'])
    .withMessage('Loại hình ghé thăm không hợp lệ'),
  body('pricePaid')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Số tiền thanh toán không được âm'),
  body('groupSize')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Số lượng người phải từ 1-20'),
  handleValidationErrors
];

// Query validation rules
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Trang phải là số nguyên dương'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Giới hạn phải từ 1-100'),
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'rating', '-rating', 'rating.average', '-rating.average', 'name', '-name'])
    .withMessage('Sắp xếp không hợp lệ'),
  query('category')
    .optional()
    .custom((value) => {
      const allowedCategories = ['restaurant', 'cafe', 'accommodation', 'entertainment', 'study'];
      const categories = value.split(',');
      for (const category of categories) {
        if (!allowedCategories.includes(category.trim())) {
          throw new Error(`Danh mục không hợp lệ: ${category.trim()}`);
        }
      }
      return true;
    }),
  handleValidationErrors
];

// ID parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('ID không hợp lệ'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validatePlace,
  validateReview,
  validatePagination,
  validateObjectId
};