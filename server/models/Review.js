const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  animeId: {
    type: String,
    required: true
  },
  animeTitle: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  aspects: {
    story: {
      type: Number,
      min: 1,
      max: 10
    },
    animation: {
      type: Number,
      min: 1,
      max: 10
    },
    sound: {
      type: Number,
      min: 1,
      max: 10
    },
    character: {
      type: Number,
      min: 1,
      max: 10
    },
    enjoyment: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  tags: [String],
  containsSpoilers: {
    type: Boolean,
    default: false
  },
  episodesWatched: {
    type: Number,
    default: 0
  },
  watchStatus: {
    type: String,
    enum: ['watching', 'completed', 'dropped', 'on_hold'],
    required: true
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  dislikes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dislikedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    containsSpoilers: {
      type: Boolean,
      default: false
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isHelpful: {
    type: Number,
    default: 0
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  moderationFlags: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'spoilers', 'offensive', 'other']
    },
    description: String,
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
reviewSchema.index({ user: 1, animeId: 1 }, { unique: true }); // One review per user per anime
reviewSchema.index({ animeId: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ 'likes.user': 1 });

// Virtual for like count
reviewSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for dislike count
reviewSchema.virtual('dislikeCount').get(function() {
  return this.dislikes.length;
});

// Virtual for comment count
reviewSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Calculate helpfulness score
reviewSchema.methods.calculateHelpfulness = function() {
  const likeCount = this.likes.length;
  const dislikeCount = this.dislikes.length;
  const commentCount = this.comments.length;
  
  // Simple helpfulness algorithm
  this.isHelpful = (likeCount * 2) - dislikeCount + (commentCount * 0.5);
  return this.isHelpful;
};

module.exports = mongoose.model('Review', reviewSchema);