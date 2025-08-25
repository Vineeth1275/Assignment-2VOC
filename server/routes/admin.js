const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Club = require('../models/Club');
const Review = require('../models/Review');
const Anime = require('../models/Anime');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalClubs,
      totalReviews,
      totalAnime,
      recentUsers,
      recentClubs,
      recentReviews
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ 
        isActive: true, 
        lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      }),
      Club.countDocuments({ isActive: true }),
      Review.countDocuments({ isVisible: true }),
      Anime.countDocuments(),
      User.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('username email avatar createdAt'),
      Club.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name creator memberCount createdAt')
        .populate('creator', 'username'),
      Review.find({ isVisible: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title animeTitle rating user createdAt')
        .populate('user', 'username')
    ]);

    // Calculate growth statistics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [newUsersThisMonth, newClubsThisMonth, newReviewsThisMonth] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, isActive: true }),
      Club.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, isActive: true }),
      Review.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, isVisible: true })
    ]);

    res.json({
      statistics: {
        totalUsers,
        activeUsers,
        totalClubs,
        totalReviews,
        totalAnime,
        newUsersThisMonth,
        newClubsThisMonth,
        newReviewsThisMonth
      },
      recentActivity: {
        users: recentUsers,
        clubs: recentClubs,
        reviews: recentReviews
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', adminAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isLength({ min: 1 }),
  query('role').optional().isIn(['user', 'moderator', 'admin']),
  query('status').optional().isIn(['active', 'inactive'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 20, search, role, status } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin only)
router.put('/users/:id/status', adminAuth, [
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deactivating other admins
    if (user.role === 'admin' && !isActive && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Cannot deactivate other administrators' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', adminAuth, [
  body('role').isIn(['user', 'moderator', 'admin']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing own role
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(403).json({ message: 'Cannot change your own role' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/clubs
// @desc    Get all clubs with pagination
// @access  Private (Admin only)
router.get('/clubs', adminAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isLength({ min: 1 }),
  query('status').optional().isIn(['active', 'inactive'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 20, search, status } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const clubs = await Club.find(query)
      .populate('creator', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Club.countDocuments(query);

    res.json({
      clubs: clubs.map(club => ({
        id: club._id,
        name: club.name,
        description: club.description,
        creator: club.creator,
        memberCount: club.members.length,
        category: club.category,
        isActive: club.isActive,
        isPrivate: club.isPrivate,
        createdAt: club.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get clubs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/clubs/:id/status
// @desc    Update club status (activate/deactivate)
// @access  Private (Admin only)
router.put('/clubs/:id/status', adminAuth, [
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { isActive } = req.body;
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    club.isActive = isActive;
    await club.save();

    res.json({
      message: `Club ${isActive ? 'activated' : 'deactivated'} successfully`,
      club: {
        id: club._id,
        name: club.name,
        isActive: club.isActive
      }
    });

  } catch (error) {
    console.error('Update club status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/reviews
// @desc    Get all reviews with moderation flags
// @access  Private (Admin only)
router.get('/reviews', adminAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('flagged').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 20, flagged } = req.query;

    // Build query
    let query = {};
    
    if (flagged === 'true') {
      query['moderationFlags.0'] = { $exists: true };
    }

    const reviews = await Review.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Review.countDocuments(query);

    res.json({
      reviews: reviews.map(review => ({
        id: review._id,
        user: review.user,
        animeTitle: review.animeTitle,
        title: review.title,
        rating: review.rating,
        containsSpoilers: review.containsSpoilers,
        isVisible: review.isVisible,
        moderationFlags: review.moderationFlags,
        likeCount: review.likes.length,
        dislikeCount: review.dislikes.length,
        createdAt: review.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/reviews/:id/visibility
// @desc    Update review visibility
// @access  Private (Admin only)
router.put('/reviews/:id/visibility', adminAuth, [
  body('isVisible').isBoolean().withMessage('isVisible must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { isVisible } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isVisible = isVisible;
    await review.save();

    res.json({
      message: `Review ${isVisible ? 'made visible' : 'hidden'} successfully`,
      review: {
        id: review._id,
        title: review.title,
        isVisible: review.isVisible
      }
    });

  } catch (error) {
    console.error('Update review visibility error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/reports
// @desc    Get moderation reports
// @access  Private (Admin only)
router.get('/reports', adminAuth, async (req, res) => {
  try {
    // Get reviews with moderation flags
    const flaggedReviews = await Review.find({
      'moderationFlags.0': { $exists: true },
      isVisible: true
    })
    .populate('user', 'username')
    .populate('moderationFlags.user', 'username')
    .sort({ 'moderationFlags.flaggedAt': -1 })
    .limit(20);

    res.json({
      reports: {
        reviews: flaggedReviews.map(review => ({
          id: review._id,
          type: 'review',
          title: review.title,
          user: review.user,
          flags: review.moderationFlags.map(flag => ({
            reason: flag.reason,
            description: flag.description,
            reportedBy: flag.user,
            flaggedAt: flag.flaggedAt
          })),
          createdAt: review.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;