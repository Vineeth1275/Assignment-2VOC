const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    },
    spoilerProtection: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    episodeReminders: {
      type: Boolean,
      default: true
    }
  },
  watchlist: [{
    animeId: {
      type: String,
      required: true
    },
    title: String,
    status: {
      type: String,
      enum: ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'],
      required: true
    },
    score: {
      type: Number,
      min: 1,
      max: 10,
      default: null
    },
    episodesWatched: {
      type: Number,
      default: 0
    },
    totalEpisodes: {
      type: Number,
      default: 0
    },
    startDate: Date,
    endDate: Date,
    notes: String,
    tags: [String],
    addedAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  clubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  }],
  friends: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'blocked'],
      default: 'pending'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  statistics: {
    totalAnime: {
      type: Number,
      default: 0
    },
    totalEpisodes: {
      type: Number,
      default: 0
    },
    totalHours: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    genreDistribution: [{
      genre: String,
      count: Number
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  lastLogin: Date,
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

// Index for better performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'watchlist.animeId': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update statistics method
userSchema.methods.updateStatistics = function() {
  const watchlist = this.watchlist;
  
  this.statistics.totalAnime = watchlist.length;
  this.statistics.totalEpisodes = watchlist.reduce((sum, item) => sum + item.episodesWatched, 0);
  
  const scoredItems = watchlist.filter(item => item.score);
  if (scoredItems.length > 0) {
    this.statistics.averageScore = scoredItems.reduce((sum, item) => sum + item.score, 0) / scoredItems.length;
  }
  
  // Estimate total hours (assuming 24 minutes per episode)
  this.statistics.totalHours = Math.round((this.statistics.totalEpisodes * 24) / 60);
};

module.exports = mongoose.model('User', userSchema);