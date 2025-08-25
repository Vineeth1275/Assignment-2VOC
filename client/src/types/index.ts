// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  preferences: UserPreferences;
  role: 'user' | 'moderator' | 'admin';
  statistics: UserStatistics;
  clubs: Club[];
  createdAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  spoilerProtection: boolean;
  emailNotifications: boolean;
  episodeReminders: boolean;
}

export interface UserStatistics {
  totalAnime: number;
  totalEpisodes: number;
  totalHours: number;
  averageScore: number;
  genreDistribution: GenreCount[];
}

export interface GenreCount {
  genre: string;
  count: number;
}

// Authentication Types
export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Anime Types
export interface Anime {
  malId: number;
  title: string;
  titleEnglish?: string;
  titleJapanese?: string;
  titleSynonyms: string[];
  type: 'TV' | 'OVA' | 'Movie' | 'Special' | 'ONA' | 'Music';
  source: string;
  episodes: number;
  status: 'Finished Airing' | 'Currently Airing' | 'Not yet aired';
  airing: boolean;
  aired: {
    from: string;
    to: string;
    string: string;
  };
  duration: string;
  rating: string;
  score: number;
  scoredBy: number;
  rank?: number;
  popularity?: number;
  members: number;
  favorites: number;
  synopsis: string;
  background?: string;
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  year?: number;
  broadcast?: {
    day: string;
    time: string;
    timezone: string;
    string: string;
  };
  producers: Studio[];
  licensors: Studio[];
  studios: Studio[];
  genres: Genre[];
  themes: Genre[];
  demographics: Genre[];
  images: {
    jpg: {
      imageUrl: string;
      smallImageUrl: string;
      largeImageUrl: string;
    };
    webp: {
      imageUrl: string;
      smallImageUrl: string;
      largeImageUrl: string;
    };
  };
  trailer?: {
    youtubeId: string;
    url: string;
    embedUrl: string;
  };
  streamingPlatforms: StreamingPlatform[];
  userStats: {
    watching: number;
    completed: number;
    onHold: number;
    dropped: number;
    planToWatch: number;
  };
}

export interface Genre {
  malId: number;
  type: string;
  name: string;
  url: string;
}

export interface Studio {
  malId: number;
  type: string;
  name: string;
  url: string;
}

export interface StreamingPlatform {
  name: string;
  url: string;
  region: string[];
}

// Watchlist Types
export interface WatchlistItem {
  animeId: string;
  title: string;
  status: WatchStatus;
  score?: number;
  episodesWatched: number;
  totalEpisodes: number;
  startDate?: string;
  endDate?: string;
  notes: string;
  tags: string[];
  addedAt: string;
  updatedAt: string;
}

export type WatchStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';

// Club Types
export interface Club {
  id: string;
  name: string;
  description: string;
  avatar: string;
  banner: string;
  creator: User;
  moderators: User[];
  members: ClubMember[];
  category: 'general' | 'anime-specific' | 'genre' | 'studio' | 'seasonal' | 'other';
  tags: string[];
  relatedAnime: RelatedAnime[];
  isPrivate: boolean;
  requiresApproval: boolean;
  maxMembers: number;
  rules: ClubRule[];
  events: ClubEvent[];
  statistics: ClubStatistics;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClubMember {
  user: User;
  joinedAt: string;
  role: 'member' | 'moderator' | 'admin';
}

export interface RelatedAnime {
  animeId: string;
  title: string;
}

export interface ClubRule {
  title: string;
  description: string;
}

export interface ClubEvent {
  title: string;
  description: string;
  date: string;
  type: 'watch-party' | 'discussion' | 'contest' | 'other';
  participants: User[];
}

export interface ClubStatistics {
  totalDiscussions: number;
  totalMessages: number;
  activeMembers: number;
}

// Review Types
export interface Review {
  id: string;
  user: User;
  animeId: string;
  animeTitle: string;
  rating: number;
  title: string;
  content: string;
  aspects: {
    story?: number;
    animation?: number;
    sound?: number;
    character?: number;
    enjoyment?: number;
  };
  tags: string[];
  containsSpoilers: boolean;
  episodesWatched: number;
  watchStatus: WatchStatus;
  likes: ReviewLike[];
  dislikes: ReviewDislike[];
  comments: ReviewComment[];
  isHelpful: number;
  isVisible: boolean;
  moderationFlags: ModerationFlag[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewLike {
  user: string;
  likedAt: string;
}

export interface ReviewDislike {
  user: string;
  dislikedAt: string;
}

export interface ReviewComment {
  id: string;
  user: User;
  content: string;
  containsSpoilers: boolean;
  likes: string[];
  createdAt: string;
}

export interface ModerationFlag {
  user: User;
  reason: 'spam' | 'inappropriate' | 'spoilers' | 'offensive' | 'other';
  description: string;
  flaggedAt: string;
}

// Discussion Types
export interface Discussion {
  id: string;
  title: string;
  content: string;
  author: User;
  club: Club;
  category: 'general' | 'episode' | 'theory' | 'recommendation' | 'other';
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  containsSpoilers: boolean;
  replies: DiscussionReply[];
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  id: string;
  content: string;
  author: User;
  containsSpoilers: boolean;
  likes: string[];
  createdAt: string;
}

// Poll Types
export interface Poll {
  id: string;
  title: string;
  description: string;
  options: PollOption[];
  creator: User;
  club: Club;
  allowMultiple: boolean;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: PollVote[];
}

export interface PollVote {
  user: string;
  votedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  type?: string;
  status?: string;
  genre?: string;
  year?: number;
  season?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface WatchlistFilters {
  status?: WatchStatus;
  sort?: 'title' | 'score' | 'episodes_watched' | 'added_at' | 'updated_at';
  order?: 'asc' | 'desc';
}

// Theme Types
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Error Types
export interface ApiError {
  message: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}