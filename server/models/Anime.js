const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
  malId: {
    type: Number,
    unique: true,
    sparse: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  titleEnglish: {
    type: String,
    trim: true
  },
  titleJapanese: {
    type: String,
    trim: true
  },
  titleSynonyms: [String],
  type: {
    type: String,
    enum: ['TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music'],
    default: 'TV'
  },
  source: {
    type: String,
    enum: ['Manga', 'Novel', 'Light novel', 'Game', 'Original', 'Music', 'Book', 'Mixed media', 'Other'],
    default: 'Manga'
  },
  episodes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Finished Airing', 'Currently Airing', 'Not yet aired'],
    default: 'Finished Airing'
  },
  airing: {
    type: Boolean,
    default: false
  },
  aired: {
    from: Date,
    to: Date,
    prop: {
      from: {
        day: Number,
        month: Number,
        year: Number
      },
      to: {
        day: Number,
        month: Number,
        year: Number
      }
    },
    string: String
  },
  duration: {
    type: String,
    default: '24 min per ep'
  },
  rating: {
    type: String,
    enum: ['G - All Ages', 'PG - Children', 'PG-13 - Teens 13 or older', 'R - 17+ (violence & profanity)', 'R+ - Mild Nudity', 'Rx - Hentai'],
    default: 'PG-13 - Teens 13 or older'
  },
  score: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  scoredBy: {
    type: Number,
    default: 0
  },
  rank: Number,
  popularity: Number,
  members: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  },
  synopsis: {
    type: String,
    trim: true
  },
  background: {
    type: String,
    trim: true
  },
  season: {
    type: String,
    enum: ['spring', 'summer', 'fall', 'winter']
  },
  year: Number,
  broadcast: {
    day: String,
    time: String,
    timezone: String,
    string: String
  },
  producers: [{
    malId: Number,
    type: String,
    name: String,
    url: String
  }],
  licensors: [{
    malId: Number,
    type: String,
    name: String,
    url: String
  }],
  studios: [{
    malId: Number,
    type: String,
    name: String,
    url: String
  }],
  genres: [{
    malId: Number,
    type: String,
    name: String,
    url: String
  }],
  themes: [{
    malId: Number,
    type: String,
    name: String,
    url: String
  }],
  demographics: [{
    malId: Number,
    type: String,
    name: String,
    url: String
  }],
  images: {
    jpg: {
      imageUrl: String,
      smallImageUrl: String,
      largeImageUrl: String
    },
    webp: {
      imageUrl: String,
      smallImageUrl: String,
      largeImageUrl: String
    }
  },
  trailer: {
    youtubeId: String,
    url: String,
    embedUrl: String,
    images: {
      imageUrl: String,
      smallImageUrl: String,
      mediumImageUrl: String,
      largeImageUrl: String,
      maximumImageUrl: String
    }
  },
  streamingPlatforms: [{
    name: String,
    url: String,
    region: [String]
  }],
  relations: [{
    relation: String,
    entry: [{
      malId: Number,
      type: String,
      name: String,
      url: String
    }]
  }],
  userStats: {
    watching: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    onHold: {
      type: Number,
      default: 0
    },
    dropped: {
      type: Number,
      default: 0
    },
    planToWatch: {
      type: Number,
      default: 0
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better search performance
animeSchema.index({ title: 'text', titleEnglish: 'text', synopsis: 'text' });
animeSchema.index({ malId: 1 });
animeSchema.index({ 'genres.name': 1 });
animeSchema.index({ status: 1 });
animeSchema.index({ score: -1 });
animeSchema.index({ popularity: 1 });
animeSchema.index({ year: -1 });

// Virtual for total users
animeSchema.virtual('totalUsers').get(function() {
  return this.userStats.watching + this.userStats.completed + 
         this.userStats.onHold + this.userStats.dropped + this.userStats.planToWatch;
});

module.exports = mongoose.model('Anime', animeSchema);