import { apiService } from './api';
import { Anime, PaginatedResponse, SearchFilters, WatchlistItem, WatchlistFilters } from '../types';

interface AnimeResponse {
  anime: Anime;
  userAnimeData?: WatchlistItem;
}

interface StreamingResponse {
  data: Array<{
    name: string;
    url: string;
  }>;
}

interface RecommendationsResponse {
  data: Array<{
    entry: Anime;
    votes: number;
  }>;
}

class AnimeService {
  // Search anime
  async searchAnime(filters: SearchFilters = {}): Promise<PaginatedResponse<Anime>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    return apiService.get<PaginatedResponse<Anime>>(`/anime/search?${params}`);
  }

  // Get anime details
  async getAnimeDetails(id: string): Promise<AnimeResponse> {
    return apiService.get<AnimeResponse>(`/anime/${id}`);
  }

  // Get top anime
  async getTopAnime(page = 1, limit = 10, type?: string, filter?: string): Promise<PaginatedResponse<Anime>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (type) params.append('type', type);
    if (filter) params.append('filter', filter);

    return apiService.get<PaginatedResponse<Anime>>(`/anime/top/anime?${params}`);
  }

  // Get seasonal anime
  async getSeasonalAnime(year: number, season: string, page = 1, limit = 10): Promise<PaginatedResponse<Anime>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return apiService.get<PaginatedResponse<Anime>>(`/anime/seasons/${year}/${season}?${params}`);
  }

  // Get anime genres
  async getGenres(): Promise<{ data: Array<{ mal_id: number; name: string; count: number }> }> {
    return apiService.get('/anime/genres');
  }

  // Get streaming links
  async getStreamingLinks(animeId: string): Promise<StreamingResponse> {
    return apiService.get<StreamingResponse>(`/anime/${animeId}/streaming`);
  }

  // Get recommendations
  async getRecommendations(animeId: string): Promise<RecommendationsResponse> {
    return apiService.get<RecommendationsResponse>(`/anime/${animeId}/recommendations`);
  }

  // Watchlist management
  async getWatchlist(filters: WatchlistFilters = {}): Promise<PaginatedResponse<WatchlistItem>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    return apiService.get<PaginatedResponse<WatchlistItem>>(`/users/watchlist?${params}`);
  }

  // Add anime to watchlist
  async addToWatchlist(data: {
    animeId: string;
    title: string;
    status: string;
    score?: number;
    episodesWatched?: number;
    totalEpisodes?: number;
    notes?: string;
    tags?: string[];
  }): Promise<{ message: string; watchlistItem: WatchlistItem }> {
    return apiService.post('/users/watchlist', data);
  }

  // Update watchlist item
  async updateWatchlistItem(animeId: string, data: Partial<WatchlistItem>): Promise<{ message: string; watchlistItem: WatchlistItem }> {
    return apiService.put(`/users/watchlist/${animeId}`, data);
  }

  // Remove from watchlist
  async removeFromWatchlist(animeId: string): Promise<{ message: string }> {
    return apiService.delete(`/users/watchlist/${animeId}`);
  }

  // Get user's anime status
  async getUserAnimeStatus(animeId: string): Promise<WatchlistItem | null> {
    try {
      const response = await this.getAnimeDetails(animeId);
      return response.userAnimeData || null;
    } catch (error) {
      return null;
    }
  }

  // Bulk update watchlist
  async bulkUpdateWatchlist(updates: Array<{ animeId: string; data: Partial<WatchlistItem> }>): Promise<{ message: string; updated: number }> {
    return apiService.put('/users/watchlist/bulk', { updates });
  }

  // Import watchlist from MAL or other services
  async importWatchlist(source: 'mal' | 'anilist', data: any): Promise<{ message: string; imported: number; errors: string[] }> {
    return apiService.post(`/users/watchlist/import/${source}`, data);
  }

  // Export watchlist
  async exportWatchlist(format: 'json' | 'csv' | 'xml' = 'json'): Promise<Blob> {
    const response = await apiService.getAxiosInstance().get(`/users/watchlist/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }
}

export const animeService = new AnimeService();