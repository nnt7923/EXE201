const express = require('express');
const Place = require('../models/Place');
const Review = require('../models/Review');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validatePlace, validatePagination, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/places
// @desc    Get all places with filtering and pagination
// @access  Public
router.get('/', validatePagination, optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      subcategory,
      minPrice,
      maxPrice,
      rating,
      search,
      lat,
      lng,
      radius = 5, // km
      sort = '-createdAt',
      features
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let pipeline = [];

    // Stage 1: Geospatial search ($geoNear) must be the first stage
    if (lat && lng) {
      pipeline.push({
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: 'distance', // Adds a 'distance' field in meters
          maxDistance: parseFloat(radius) * 1000,
          query: { isActive: true }, // Pre-filter in geoNear for efficiency
          spherical: true
        }
      });
    }

    // Stage 2: Build the main filter ($match)
    const matchFilter = lat && lng ? {} : { isActive: true }; // If not geo-searched, add isActive here

    if (category) matchFilter.category = category;
    if (subcategory) matchFilter.subcategory = subcategory;
    if (rating) matchFilter['rating.average'] = { $gte: parseFloat(rating) };
    if (minPrice) matchFilter['pricing.minPrice'] = { $gte: parseFloat(minPrice) };
    if (maxPrice) matchFilter['pricing.maxPrice'] = { $lte: parseFloat(maxPrice) };
    
    if (features) {
      const featureArray = features.split(',');
      featureArray.forEach(feature => {
        matchFilter[`features.${feature}`] = true;
      });
    }

    // Text search can be combined in the match filter
    if (search) {
        matchFilter.$text = { $search: search };
    }

    // Only add the $match stage if there are filters to apply
    if (Object.keys(matchFilter).length > 0) {
        pipeline.push({ $match: matchFilter });
    }

    // Build count pipeline (it's the same as the main pipeline up to this point)
    const countPipeline = [...pipeline, { $count: 'total' }];

    // Stage 3: Sorting
    // If it's a geo-search, it's already sorted by distance.
    // Otherwise, apply the requested sort.
    if (!lat || !lng) {
      const sortStage = {};
      const sortParams = sort.split(',');
      sortParams.forEach(param => {
        if (param.startsWith('-')) {
          sortStage[param.substring(1)] = -1;
        } else {
          sortStage[param] = 1;
        }
      });
      pipeline.push({ $sort: sortStage });
    }

    // Stage 4: Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    // Stage 5: Population (manual lookup)
    pipeline.push({
      $lookup: {
        from: 'users', // The collection name for the User model
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy'
      }
    });
    pipeline.push({
      $unwind: { // Deconstructs the createdBy array field
        path: '$createdBy',
        preserveNullAndEmptyArrays: true // Keep places even if creator is not found
      }
    });

    // Stage 6: Project final fields
    pipeline.push({
      $project: {
        name: 1,
        description: 1,
        category: 1,
        subcategory: 1,
        address: 1,
        pricing: 1,
        rating: 1,
        images: 1,
        tags: 1,
        features: 1,
        hours: 1,
        contact: 1,
        isActive: 1,
        viewCount: 1,
        createdAt: 1,
        updatedAt: 1,
        distance: 1, // from $geoNear
        createdBy: { // Project sub-fields of createdBy
          _id: '$createdBy._id',
          name: '$createdBy.name',
          avatar: '$createdBy.avatar',
        }
      }
    });

    // Execute main pipeline and count pipeline in parallel
    const [places, totalResult] = await Promise.all([
      Place.aggregate(pipeline),
      Place.aggregate(countPipeline)
    ]);

    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    res.json({
      success: true,
      data: {
        places,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get places error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách địa điểm',
      error: error.message
    });
  }
});

// @route   GET /api/places/:id
// @desc    Get single place by ID
// @access  Public
router.get('/:id', validateObjectId, optionalAuth, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)
      .populate('createdBy', 'name avatar')
      .lean();

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa điểm'
      });
    }

    // Increment view count
    await Place.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    // Get recent reviews
    const reviews = await Review.find({ place: req.params.id, isActive: true })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        place: {
          ...place,
          recentReviews: reviews
        }
      }
    });
  } catch (error) {
    console.error('Get place error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin địa điểm',
      error: error.message
    });
  }
});

// @route   POST /api/places
// @desc    Create new place
// @access  Private
router.post('/', authenticateToken, validatePlace, async (req, res) => {
  try {
    const placeData = {
      ...req.body,
      createdBy: req.user._id
    };

    const place = new Place(placeData);
    await place.save();

    await place.populate('createdBy', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Tạo địa điểm thành công',
      data: { place }
    });
  } catch (error) {
    console.error('Create place error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo địa điểm',
      error: error.message
    });
  }
});

// @route   PUT /api/places/:id
// @desc    Update place
// @access  Private
router.put('/:id', validateObjectId, authenticateToken, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa điểm'
      });
    }

    // Check if user owns the place or is admin
    if (place.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền chỉnh sửa địa điểm này'
      });
    }

    const updatedPlace = await Place.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name avatar');

    res.json({
      success: true,
      message: 'Cập nhật địa điểm thành công',
      data: { place: updatedPlace }
    });
  } catch (error) {
    console.error('Update place error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật địa điểm',
      error: error.message
    });
  }
});

// @route   DELETE /api/places/:id
// @desc    Delete place
// @access  Private
router.delete('/:id', validateObjectId, authenticateToken, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa điểm'
      });
    }

    // Check if user owns the place or is admin
    if (place.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa địa điểm này'
      });
    }

    // Soft delete
    place.isActive = false;
    await place.save();

    res.json({
      success: true,
      message: 'Xóa địa điểm thành công'
    });
  } catch (error) {
    console.error('Delete place error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa địa điểm',
      error: error.message
    });
  }
});

// @route   GET /api/places/:id/reviews
// @desc    Get reviews for a place
// @access  Public
router.get('/:id/reviews', validateObjectId, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ 
      place: req.params.id, 
      isActive: true 
    })
      .populate('user', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Review.countDocuments({ 
      place: req.params.id, 
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get place reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy đánh giá',
      error: error.message
    });
  }
});

// @route   GET /api/places/categories/list
// @desc    Get list of categories and subcategories
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = {
      restaurant: {
        name: 'Nhà hàng',
        subcategories: [
          'Cơm tấm', 'Phở', 'Bún bò Huế', 'Bún chả', 'Bánh mì', 'Chả cá',
          'Lẩu', 'Nướng', 'Hải sản', 'Đồ chay', 'Món Nhật', 'Món Hàn',
          'Món Thái', 'Món Trung', 'Pizza', 'Burger', 'Món Âu'
        ]
      },
      cafe: {
        name: 'Cà phê',
        subcategories: [
          'Cà phê truyền thống', 'Cà phê hiện đại', 'Trà sữa', 'Sinh tố',
          'Nước ép', 'Smoothie', 'Cà phê học bài', 'Cà phê làm việc'
        ]
      },
      accommodation: {
        name: 'Nhà trọ',
        subcategories: [
          'Phòng trọ', 'Ký túc xá', 'Homestay', 'Khách sạn mini',
          'Căn hộ cho thuê', 'Nhà nguyên căn'
        ]
      },
      entertainment: {
        name: 'Giải trí',
        subcategories: [
          'Karaoke', 'Game center', 'Cinema', 'Bowling', 'Billiards',
          'Escape room', 'VR game', 'Board game cafe'
        ]
      },
      study: {
        name: 'Học tập',
        subcategories: [
          'Thư viện', 'Cà phê học bài', 'Co-working space', 'Lớp học',
          'Trung tâm ngoại ngữ', 'Luyện thi'
        ]
      }
    };

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh mục',
      error: error.message
    });
  }
});

module.exports = router;

