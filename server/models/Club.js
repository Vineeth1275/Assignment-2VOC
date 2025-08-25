const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  avatar: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    }
  }],
  category: {
    type: String,
    enum: ['general', 'anime-specific', 'genre', 'studio', 'seasonal', 'other'],
    default: 'general'
  },
  tags: [String],
  relatedAnime: [{
    animeId: String,
    title: String
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  maxMembers: {
    type: Number,
    default: 1000
  },
  rules: [{
    title: String,
    description: String
  }],
  discussions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion'
  }],
  polls: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll'
  }],
  events: [{
    title: String,
    description: String,
    date: Date,
    type: {
      type: String,
      enum: ['watch-party', 'discussion', 'contest', 'other'],
      default: 'discussion'
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  statistics: {
    totalDiscussions: {
      type: Number,
      default: 0
    },
    totalMessages: {
      type: Number,
      default: 0
    },
    activeMembers: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
clubSchema.index({ name: 'text', description: 'text' });
clubSchema.index({ creator: 1 });
clubSchema.index({ 'members.user': 1 });
clubSchema.index({ category: 1 });
clubSchema.index({ isPrivate: 1 });

// Virtual for member count
clubSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

module.exports = mongoose.model('Club', clubSchema);