const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Club = require('../models/Club');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/clubs
// @desc    Get all clubs
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('search').optional().isLength({ min: 1 }),
  query('category').optional().isIn(['general', 'anime-specific', 'genre', 'studio', 'seasonal', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 12, search, category } = req.query;

    // Build query
    let query = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) {
      query.category = category;
    }

    const clubs = await Club.find(query)
      .populate('creator', 'username avatar')
      .populate('members.user', 'username avatar')
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
        avatar: club.avatar,
        banner: club.banner,
        creator: club.creator,
        category: club.category,
        tags: club.tags,
        memberCount: club.members.length,
        isPrivate: club.isPrivate,
        requiresApproval: club.requiresApproval,
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

// @route   POST /api/clubs
// @desc    Create a new club
// @access  Private
router.post('/', auth, [
  body('name')
    .isLength({ min: 3, max: 100 })
    .withMessage('Club name must be between 3 and 100 characters')
    .trim(),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),
  body('category')
    .isIn(['general', 'anime-specific', 'genre', 'studio', 'seasonal', 'other'])
    .withMessage('Invalid category'),
  body('tags').optional().isArray(),
  body('isPrivate').optional().isBoolean(),
  body('requiresApproval').optional().isBoolean(),
  body('maxMembers').optional().isInt({ min: 2, max: 10000 })
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
      name,
      description,
      category,
      tags = [],
      isPrivate = false,
      requiresApproval = false,
      maxMembers = 1000
    } = req.body;

    // Check if club name already exists
    const existingClub = await Club.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingClub) {
      return res.status(400).json({ message: 'Club name already exists' });
    }

    const club = new Club({
      name,
      description,
      category,
      tags,
      isPrivate,
      requiresApproval,
      maxMembers,
      creator: req.user._id,
      moderators: [req.user._id],
      members: [{
        user: req.user._id,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    await club.save();

    // Add club to user's clubs list
    await User.findByIdAndUpdate(req.user._id, {
      $push: { clubs: club._id }
    });

    await club.populate('creator', 'username avatar');

    res.status(201).json({
      message: 'Club created successfully',
      club: {
        id: club._id,
        name: club.name,
        description: club.description,
        avatar: club.avatar,
        banner: club.banner,
        creator: club.creator,
        category: club.category,
        tags: club.tags,
        memberCount: club.members.length,
        isPrivate: club.isPrivate,
        requiresApproval: club.requiresApproval,
        createdAt: club.createdAt
      }
    });

  } catch (error) {
    console.error('Create club error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/clubs/:id
// @desc    Get club details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('creator', 'username avatar bio')
      .populate('moderators', 'username avatar')
      .populate('members.user', 'username avatar bio')
      .populate('discussions')
      .populate('polls');

    if (!club || !club.isActive) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.json({
      club: {
        id: club._id,
        name: club.name,
        description: club.description,
        avatar: club.avatar,
        banner: club.banner,
        creator: club.creator,
        moderators: club.moderators,
        members: club.members,
        category: club.category,
        tags: club.tags,
        relatedAnime: club.relatedAnime,
        isPrivate: club.isPrivate,
        requiresApproval: club.requiresApproval,
        maxMembers: club.maxMembers,
        rules: club.rules,
        events: club.events,
        statistics: club.statistics,
        createdAt: club.createdAt
      }
    });

  } catch (error) {
    console.error('Get club error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/clubs/:id/join
// @desc    Join a club
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club || !club.isActive) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if already a member
    const isMember = club.members.some(member => member.user.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this club' });
    }

    // Check if club is full
    if (club.members.length >= club.maxMembers) {
      return res.status(400).json({ message: 'Club is full' });
    }

    // Add member
    club.members.push({
      user: req.user._id,
      role: 'member',
      joinedAt: new Date()
    });

    await club.save();

    // Add club to user's clubs list
    await User.findByIdAndUpdate(req.user._id, {
      $push: { clubs: club._id }
    });

    res.json({ message: 'Successfully joined the club' });

  } catch (error) {
    console.error('Join club error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/clubs/:id/leave
// @desc    Leave a club
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club || !club.isActive) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if user is a member
    const memberIndex = club.members.findIndex(member => member.user.toString() === req.user._id.toString());
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'Not a member of this club' });
    }

    // Check if user is the creator
    if (club.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Club creator cannot leave. Transfer ownership or delete the club.' });
    }

    // Remove member
    club.members.splice(memberIndex, 1);
    
    // Remove from moderators if applicable
    club.moderators = club.moderators.filter(mod => mod.toString() !== req.user._id.toString());

    await club.save();

    // Remove club from user's clubs list
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { clubs: club._id }
    });

    res.json({ message: 'Successfully left the club' });

  } catch (error) {
    console.error('Leave club error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/clubs/:id
// @desc    Update club details
// @access  Private (Admin/Moderator only)
router.put('/:id', auth, [
  body('name').optional().isLength({ min: 3, max: 100 }).trim(),
  body('description').optional().isLength({ min: 10, max: 1000 }).trim(),
  body('category').optional().isIn(['general', 'anime-specific', 'genre', 'studio', 'seasonal', 'other']),
  body('tags').optional().isArray(),
  body('isPrivate').optional().isBoolean(),
  body('requiresApproval').optional().isBoolean(),
  body('maxMembers').optional().isInt({ min: 2, max: 10000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const club = await Club.findById(req.params.id);
    if (!club || !club.isActive) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if user is admin or moderator
    const member = club.members.find(member => member.user.toString() === req.user._id.toString());
    if (!member || (member.role !== 'admin' && member.role !== 'moderator')) {
      return res.status(403).json({ message: 'Not authorized to update this club' });
    }

    const { name, description, category, tags, isPrivate, requiresApproval, maxMembers } = req.body;

    // Check if new name conflicts with existing clubs
    if (name && name !== club.name) {
      const existingClub = await Club.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: club._id }
      });
      if (existingClub) {
        return res.status(400).json({ message: 'Club name already exists' });
      }
      club.name = name;
    }

    if (description !== undefined) club.description = description;
    if (category !== undefined) club.category = category;
    if (tags !== undefined) club.tags = tags;
    if (isPrivate !== undefined) club.isPrivate = isPrivate;
    if (requiresApproval !== undefined) club.requiresApproval = requiresApproval;
    if (maxMembers !== undefined) club.maxMembers = maxMembers;

    await club.save();

    res.json({
      message: 'Club updated successfully',
      club: {
        id: club._id,
        name: club.name,
        description: club.description,
        category: club.category,
        tags: club.tags,
        isPrivate: club.isPrivate,
        requiresApproval: club.requiresApproval,
        maxMembers: club.maxMembers
      }
    });

  } catch (error) {
    console.error('Update club error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/clubs/:id
// @desc    Delete a club
// @access  Private (Creator only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club || !club.isActive) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if user is the creator
    if (club.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the club creator can delete the club' });
    }

    // Mark as inactive instead of deleting
    club.isActive = false;
    await club.save();

    // Remove club from all members' clubs lists
    await User.updateMany(
      { clubs: club._id },
      { $pull: { clubs: club._id } }
    );

    res.json({ message: 'Club deleted successfully' });

  } catch (error) {
    console.error('Delete club error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;