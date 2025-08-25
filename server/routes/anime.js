const express = require('express');
const axios = require('axios');
const { body, query, validationResult } = require('express-validator');
const Anime = require('../models/Anime');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Jikan API base URL
const JIKAN_API = 'https://api.jikan.moe/v4';

// @route   GET /api/anime/search
// @desc    Search anime
// @access  Public
router.get('/search', [
  query('q').optional().isLength({ min: 1 }).withMessage('Search query must not be empty'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 25 }).withMessage('Limit must be between 1 and 25'),
  query('type').optional().isIn(['tv', 'movie', 'ova', 'special', 'ona', 'music']),
  query('status').optional().isIn(['airing', 'complete', 'upcoming']),
  query('genre').optional().isInt({ min: 1 }),
  query('order_by').optional().isIn(['mal_id', 'title', 'type', 'rating', 'start_date', 'end_date', 'episodes', 'score', 'scored_by', 'rank', 'popularity', 'members', 'favorites']),
  query('sort').optional().isIn(['desc', 'asc'])
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
      q = '',
      page = 1,
      limit = 10,
      type,
      status,
      genre,
      order_by = 'popularity',
      sort = 'asc'
    } = req.query;

    // Build query parameters
    const params = {
      q,
      page,
      limit,
      order_by,
      sort
    };

    if (type) params.type = type;
    if (status) params.status = status;
    if (genre) params.genres = genre;

    // Search from Jikan API
    const response = await axios.get(`${JIKAN_API}/anime`, { params });
    const animeList = response.data.data;

    // Store/update anime in our database
    for (const anime of animeList) {
      await Anime.findOneAndUpdate(
        { malId: anime.mal_id },
        {
          malId: anime.mal_id,
          title: anime.title,
          titleEnglish: anime.title_english,
          titleJapanese: anime.title_japanese,
          titleSynonyms: anime.title_synonyms || [],
          type: anime.type,
          source: anime.source,
          episodes: anime.episodes || 0,
          status: anime.status,
          airing: anime.airing,
          aired: anime.aired,
          duration: anime.duration,
          rating: anime.rating,
          score: anime.score || 0,
          scoredBy: anime.scored_by || 0,
          rank: anime.rank,
          popularity: anime.popularity,
          members: anime.members || 0,
          favorites: anime.favorites || 0,
          synopsis: anime.synopsis,
          background: anime.background,
          season: anime.season,
          year: anime.year,
          broadcast: anime.broadcast,
          producers: anime.producers || [],
          licensors: anime.licensors || [],
          studios: anime.studios || [],
          genres: anime.genres || [],
          themes: anime.themes || [],
          demographics: anime.demographics || [],
          images: anime.images,
          trailer: anime.trailer,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      data: animeList,
      pagination: response.data.pagination
    });

  } catch (error) {
    console.error('Anime search error:', error);
    if (error.response?.status === 429) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    res.status(500).json({ message: 'Error searching anime' });
  }
});

// @route   GET /api/anime/:id
// @desc    Get anime details
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Try to get from database first
    let anime = await Anime.findOne({ malId: id });

    // If not in database or outdated, fetch from API
    if (!anime || (new Date() - anime.lastUpdated) > 24 * 60 * 60 * 1000) {
      try {
        const response = await axios.get(`${JIKAN_API}/anime/${id}`);
        const animeData = response.data.data;

        anime = await Anime.findOneAndUpdate(
          { malId: id },
          {
            malId: animeData.mal_id,
            title: animeData.title,
            titleEnglish: animeData.title_english,
            titleJapanese: animeData.title_japanese,
            titleSynonyms: animeData.title_synonyms || [],
            type: animeData.type,
            source: animeData.source,
            episodes: animeData.episodes || 0,
            status: animeData.status,
            airing: animeData.airing,
            aired: animeData.aired,
            duration: animeData.duration,
            rating: animeData.rating,
            score: animeData.score || 0,
            scoredBy: animeData.scored_by || 0,
            rank: animeData.rank,
            popularity: animeData.popularity,
            members: animeData.members || 0,
            favorites: animeData.favorites || 0,
            synopsis: animeData.synopsis,
            background: animeData.background,
            season: animeData.season,
            year: animeData.year,
            broadcast: animeData.broadcast,
            producers: animeData.producers || [],
            licensors: animeData.licensors || [],
            studios: animeData.studios || [],
            genres: animeData.genres || [],
            themes: animeData.themes || [],
            demographics: animeData.demographics || [],
            images: animeData.images,
            trailer: animeData.trailer,
            lastUpdated: new Date()
          },
          { upsert: true, new: true }
        );
      } catch (apiError) {
        if (!anime) {
          return res.status(404).json({ message: 'Anime not found' });
        }
      }
    }

    // Add user-specific data if authenticated
    let userAnimeData = null;
    if (req.user) {
      const user = await User.findById(req.user._id);
      userAnimeData = user.watchlist.find(item => item.animeId === id);
    }

    res.json({
      anime,
      userAnimeData
    });

  } catch (error) {
    console.error('Get anime error:', error);
    res.status(500).json({ message: 'Error fetching anime details' });
  }
});

// @route   GET /api/anime/top/anime
// @desc    Get top anime
// @access  Public
router.get('/top/anime', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 25 }),
  query('type').optional().isIn(['tv', 'movie', 'ova', 'special', 'ona', 'music']),
  query('filter').optional().isIn(['airing', 'upcoming', 'bypopularity', 'favorite'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, type, filter } = req.query;

    const params = { page, limit };
    if (type) params.type = type;
    if (filter) params.filter = filter;

    const response = await axios.get(`${JIKAN_API}/top/anime`, { params });
    
    res.json({
      data: response.data.data,
      pagination: response.data.pagination
    });

  } catch (error) {
    console.error('Top anime error:', error);
    res.status(500).json({ message: 'Error fetching top anime' });
  }
});

// @route   GET /api/anime/seasons/:year/:season
// @desc    Get seasonal anime
// @access  Public
router.get('/seasons/:year/:season', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 25 })
], async (req, res) => {
  try {
    const { year, season } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!['spring', 'summer', 'fall', 'winter'].includes(season)) {
      return res.status(400).json({ message: 'Invalid season' });
    }

    const response = await axios.get(`${JIKAN_API}/seasons/${year}/${season}`, {
      params: { page, limit }
    });

    res.json({
      data: response.data.data,
      pagination: response.data.pagination
    });

  } catch (error) {
    console.error('Seasonal anime error:', error);
    res.status(500).json({ message: 'Error fetching seasonal anime' });
  }
});

// @route   GET /api/anime/genres
// @desc    Get anime genres
// @access  Public
router.get('/genres', async (req, res) => {
  try {
    const response = await axios.get(`${JIKAN_API}/genres/anime`);
    
    res.json({
      data: response.data.data
    });

  } catch (error) {
    console.error('Genres error:', error);
    res.status(500).json({ message: 'Error fetching genres' });
  }
});

// @route   GET /api/anime/:id/streaming
// @desc    Get streaming links for anime
// @access  Public
router.get('/:id/streaming', async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${JIKAN_API}/anime/${id}/streaming`);
    
    res.json({
      data: response.data.data
    });

  } catch (error) {
    console.error('Streaming links error:', error);
    res.status(500).json({ message: 'Error fetching streaming links' });
  }
});

// @route   GET /api/anime/:id/recommendations
// @desc    Get anime recommendations
// @access  Public
router.get('/:id/recommendations', async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${JIKAN_API}/anime/${id}/recommendations`);
    
    res.json({
      data: response.data.data
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Error fetching recommendations' });
  }
});

module.exports = router;