const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile/:username
// @desc    Get user profile
// @access  Public
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username, isActive: true })
      .select('-password -email')
      .populate('clubs', 'name description avatar memberCount');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        statistics: user.statistics,
        clubs: user.clubs,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, bio, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        preferences: user.preferences,
        role: user.role,
        statistics: user.statistics
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, [
  body('theme').optional().isIn(['light', 'dark']),
  body('language').optional().isLength({ min: 2, max: 5 }),
  body('spoilerProtection').optional().isBoolean(),
  body('emailNotifications').optional().isBoolean(),
  body('episodeReminders').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { theme, language, spoilerProtection, emailNotifications, episodeReminders } = req.body;

    if (theme !== undefined) user.preferences.theme = theme;
    if (language !== undefined) user.preferences.language = language;
    if (spoilerProtection !== undefined) user.preferences.spoilerProtection = spoilerProtection;
    if (emailNotifications !== undefined) user.preferences.emailNotifications = emailNotifications;
    if (episodeReminders !== undefined) user.preferences.episodeReminders = episodeReminders;

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/watchlist
// @desc    Get user's watchlist
// @access  Private
router.get('/watchlist', auth, [
  query('status').optional().isIn(['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch']),
  query('sort').optional().isIn(['title', 'score', 'episodes_watched', 'added_at', 'updated_at']),
  query('order').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, sort = 'updated_at', order = 'desc', page = 1, limit = 20 } = req.query;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let watchlist = user.watchlist;

    // Filter by status
    if (status) {
      watchlist = watchlist.filter(item => item.status === status);
    }

    // Sort
    watchlist.sort((a, b) => {
      let aVal, bVal;
      
      switch (sort) {
        case 'title':
          aVal = a.title?.toLowerCase() || '';
          bVal = b.title?.toLowerCase() || '';
          break;
        case 'score':
          aVal = a.score || 0;
          bVal = b.score || 0;
          break;
        case 'episodes_watched':
          aVal = a.episodesWatched || 0;
          bVal = b.episodesWatched || 0;
          break;
        case 'added_at':
          aVal = a.addedAt;
          bVal = b.addedAt;
          break;
        case 'updated_at':
        default:
          aVal = a.updatedAt;
          bVal = b.updatedAt;
          break;
      }

      if (order === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedWatchlist = watchlist.slice(startIndex, endIndex);

    res.json({
      watchlist: paginatedWatchlist,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: watchlist.length,
        pages: Math.ceil(watchlist.length / limit)
      }
    });

  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/watchlist
// @desc    Add anime to watchlist
// @access  Private
router.post('/watchlist', auth, [
  body('animeId').notEmpty().withMessage('Anime ID is required'),
  body('title').notEmpty().withMessage('Anime title is required'),
  body('status').isIn(['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch']).withMessage('Invalid status'),
  body('score').optional().isInt({ min: 1, max: 10 }).withMessage('Score must be between 1 and 10'),
  body('episodesWatched').optional().isInt({ min: 0 }).withMessage('Episodes watched must be a positive number'),
  body('totalEpisodes').optional().isInt({ min: 0 }).withMessage('Total episodes must be a positive number'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { animeId, title, status, score, episodesWatched, totalEpisodes, notes, tags } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if anime is already in watchlist
    const existingIndex = user.watchlist.findIndex(item => item.animeId === animeId);
    
    if (existingIndex !== -1) {
      return res.status(400).json({ message: 'Anime already in watchlist' });
    }

    // Add to watchlist
    const watchlistItem = {
      animeId,
      title,
      status,
      score: score || null,
      episodesWatched: episodesWatched || 0,
      totalEpisodes: totalEpisodes || 0,
      notes: notes || '',
      tags: tags || [],
      addedAt: new Date(),
      updatedAt: new Date()
    };

    if (status === 'completed' && !watchlistItem.endDate) {
      watchlistItem.endDate = new Date();
    }
    if (status === 'watching' && !watchlistItem.startDate) {
      watchlistItem.startDate = new Date();
    }

    user.watchlist.push(watchlistItem);
    user.updateStatistics();
    await user.save();

    res.status(201).json({
      message: 'Anime added to watchlist',
      watchlistItem
    });

  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/watchlist/:animeId
// @desc    Update anime in watchlist
// @access  Private
router.put('/watchlist/:animeId', auth, [
  body('status').optional().isIn(['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch']),
  body('score').optional().isInt({ min: 1, max: 10 }),
  body('episodesWatched').optional().isInt({ min: 0 }),
  body('totalEpisodes').optional().isInt({ min: 0 }),
  body('notes').optional().isLength({ max: 1000 }),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { animeId } = req.params;
    const { status, score, episodesWatched, totalEpisodes, notes, tags } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const watchlistItem = user.watchlist.find(item => item.animeId === animeId);
    if (!watchlistItem) {
      return res.status(404).json({ message: 'Anime not found in watchlist' });
    }

    // Update fields
    if (status !== undefined) {
      const oldStatus = watchlistItem.status;
      watchlistItem.status = status;
      
      // Update dates based on status change
      if (status === 'watching' && oldStatus !== 'watching' && !watchlistItem.startDate) {
        watchlistItem.startDate = new Date();
      }
      if (status === 'completed' && oldStatus !== 'completed') {
        watchlistItem.endDate = new Date();
      }
    }
    
    if (score !== undefined) watchlistItem.score = score;
    if (episodesWatched !== undefined) watchlistItem.episodesWatched = episodesWatched;
    if (totalEpisodes !== undefined) watchlistItem.totalEpisodes = totalEpisodes;
    if (notes !== undefined) watchlistItem.notes = notes;
    if (tags !== undefined) watchlistItem.tags = tags;
    
    watchlistItem.updatedAt = new Date();

    user.updateStatistics();
    await user.save();

    res.json({
      message: 'Watchlist updated successfully',
      watchlistItem
    });

  } catch (error) {
    console.error('Update watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/watchlist/:animeId
// @desc    Remove anime from watchlist
// @access  Private
router.delete('/watchlist/:animeId', auth, async (req, res) => {
  try {
    const { animeId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const initialLength = user.watchlist.length;
    user.watchlist = user.watchlist.filter(item => item.animeId !== animeId);

    if (user.watchlist.length === initialLength) {
      return res.status(404).json({ message: 'Anime not found in watchlist' });
    }

    user.updateStatistics();
    await user.save();

    res.json({ message: 'Anime removed from watchlist' });

  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/statistics
// @desc    Get user statistics
// @access  Private
router.get('/statistics', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update statistics before returning
    user.updateStatistics();
    await user.save();

    // Calculate additional statistics
    const watchlist = user.watchlist;
    const statusCounts = {
      watching: watchlist.filter(item => item.status === 'watching').length,
      completed: watchlist.filter(item => item.status === 'completed').length,
      on_hold: watchlist.filter(item => item.status === 'on_hold').length,
      dropped: watchlist.filter(item => item.status === 'dropped').length,
      plan_to_watch: watchlist.filter(item => item.status === 'plan_to_watch').length
    };

    const scoreDistribution = {};
    for (let i = 1; i <= 10; i++) {
      scoreDistribution[i] = watchlist.filter(item => item.score === i).length;
    }

    res.json({
      statistics: user.statistics,
      statusCounts,
      scoreDistribution,
      recentActivity: watchlist
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 10)
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;