const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Review = require('../models/Review');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get reviews for an anime
// @access  Public
router.get('/', [
  query('animeId').notEmpty().withMessage('Anime ID is required'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 20 }),
  query('sortBy').optional().isIn(['newest', 'oldest', 'rating_high', 'rating_low', 'helpful'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { animeId, page = 1, limit = 10, sortBy = 'newest' } = req.query;

    // Build sort criteria
    let sortCriteria = {};
    switch (sortBy) {
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'rating_high':
        sortCriteria = { rating: -1 };
        break;
      case 'rating_low':
        sortCriteria = { rating: 1 };
        break;
      case 'helpful':
        sortCriteria = { isHelpful: -1 };
        break;
      case 'newest':
      default:
        sortCriteria = { createdAt: -1 };
        break;
    }

    const reviews = await Review.find({ animeId, isVisible: true })
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar')
      .sort(sortCriteria)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Review.countDocuments({ animeId, isVisible: true });

    res.json({
      reviews: reviews.map(review => ({
        id: review._id,
        user: review.user,
        animeId: review.animeId,
        animeTitle: review.animeTitle,
        rating: review.rating,
        title: review.title,
        content: review.content,
        aspects: review.aspects,
        tags: review.tags,
        containsSpoilers: review.containsSpoilers,
        episodesWatched: review.episodesWatched,
        watchStatus: review.watchStatus,
        likeCount: review.likes.length,
        dislikeCount: review.dislikes.length,
        commentCount: review.comments.length,
        isHelpful: review.isHelpful,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
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

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', auth, [
  body('animeId').notEmpty().withMessage('Anime ID is required'),
  body('animeTitle').notEmpty().withMessage('Anime title is required'),
  body('rating').isInt({ min: 1, max: 10 }).withMessage('Rating must be between 1 and 10'),
  body('title').isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters').trim(),
  body('content').isLength({ min: 50, max: 5000 }).withMessage('Content must be between 50 and 5000 characters').trim(),
  body('aspects.story').optional().isInt({ min: 1, max: 10 }),
  body('aspects.animation').optional().isInt({ min: 1, max: 10 }),
  body('aspects.sound').optional().isInt({ min: 1, max: 10 }),
  body('aspects.character').optional().isInt({ min: 1, max: 10 }),
  body('aspects.enjoyment').optional().isInt({ min: 1, max: 10 }),
  body('tags').optional().isArray(),
  body('containsSpoilers').optional().isBoolean(),
  body('episodesWatched').optional().isInt({ min: 0 }),
  body('watchStatus').isIn(['watching', 'completed', 'dropped', 'on_hold'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      animeId,
      animeTitle,
      rating,
      title,
      content,
      aspects = {},
      tags = [],
      containsSpoilers = false,
      episodesWatched = 0,
      watchStatus
    } = req.body;

    // Check if user already reviewed this anime
    const existingReview = await Review.findOne({ user: req.user._id, animeId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this anime' });
    }

    const review = new Review({
      user: req.user._id,
      animeId,
      animeTitle,
      rating,
      title,
      content,
      aspects,
      tags,
      containsSpoilers,
      episodesWatched,
      watchStatus
    });

    await review.save();
    await review.populate('user', 'username avatar');

    res.status(201).json({
      message: 'Review created successfully',
      review: {
        id: review._id,
        user: review.user,
        animeId: review.animeId,
        animeTitle: review.animeTitle,
        rating: review.rating,
        title: review.title,
        content: review.content,
        aspects: review.aspects,
        tags: review.tags,
        containsSpoilers: review.containsSpoilers,
        episodesWatched: review.episodesWatched,
        watchStatus: review.watchStatus,
        likeCount: 0,
        dislikeCount: 0,
        commentCount: 0,
        isHelpful: 0,
        createdAt: review.createdAt
      }
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', auth, [
  body('rating').optional().isInt({ min: 1, max: 10 }),
  body('title').optional().isLength({ min: 5, max: 200 }).trim(),
  body('content').optional().isLength({ min: 50, max: 5000 }).trim(),
  body('aspects.story').optional().isInt({ min: 1, max: 10 }),
  body('aspects.animation').optional().isInt({ min: 1, max: 10 }),
  body('aspects.sound').optional().isInt({ min: 1, max: 10 }),
  body('aspects.character').optional().isInt({ min: 1, max: 10 }),
  body('aspects.enjoyment').optional().isInt({ min: 1, max: 10 }),
  body('tags').optional().isArray(),
  body('containsSpoilers').optional().isBoolean(),
  body('episodesWatched').optional().isInt({ min: 0 }),
  body('watchStatus').optional().isIn(['watching', 'completed', 'dropped', 'on_hold'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const {
      rating,
      title,
      content,
      aspects,
      tags,
      containsSpoilers,
      episodesWatched,
      watchStatus
    } = req.body;

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (content !== undefined) review.content = content;
    if (aspects !== undefined) review.aspects = { ...review.aspects, ...aspects };
    if (tags !== undefined) review.tags = tags;
    if (containsSpoilers !== undefined) review.containsSpoilers = containsSpoilers;
    if (episodesWatched !== undefined) review.episodesWatched = episodesWatched;
    if (watchStatus !== undefined) review.watchStatus = watchStatus;

    await review.save();
    await review.populate('user', 'username avatar');

    res.json({
      message: 'Review updated successfully',
      review
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review deleted successfully' });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:id/like
// @desc    Like a review
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if already liked
    const alreadyLiked = review.likes.some(like => like.user.toString() === req.user._id.toString());
    if (alreadyLiked) {
      return res.status(400).json({ message: 'Review already liked' });
    }

    // Remove from dislikes if exists
    review.dislikes = review.dislikes.filter(dislike => dislike.user.toString() !== req.user._id.toString());

    // Add like
    review.likes.push({ user: req.user._id });
    review.calculateHelpfulness();
    await review.save();

    res.json({ 
      message: 'Review liked successfully',
      likeCount: review.likes.length,
      dislikeCount: review.dislikes.length
    });

  } catch (error) {
    console.error('Like review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:id/dislike
// @desc    Dislike a review
// @access  Private
router.post('/:id/dislike', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if already disliked
    const alreadyDisliked = review.dislikes.some(dislike => dislike.user.toString() === req.user._id.toString());
    if (alreadyDisliked) {
      return res.status(400).json({ message: 'Review already disliked' });
    }

    // Remove from likes if exists
    review.likes = review.likes.filter(like => like.user.toString() !== req.user._id.toString());

    // Add dislike
    review.dislikes.push({ user: req.user._id });
    review.calculateHelpfulness();
    await review.save();

    res.json({ 
      message: 'Review disliked successfully',
      likeCount: review.likes.length,
      dislikeCount: review.dislikes.length
    });

  } catch (error) {
    console.error('Dislike review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:id/comments
// @desc    Add comment to review
// @access  Private
router.post('/:id/comments', auth, [
  body('content').isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters').trim(),
  body('containsSpoilers').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, containsSpoilers = false } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const comment = {
      user: req.user._id,
      content,
      containsSpoilers,
      likes: [],
      createdAt: new Date()
    };

    review.comments.push(comment);
    await review.save();

    await review.populate('comments.user', 'username avatar');
    const newComment = review.comments[review.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;