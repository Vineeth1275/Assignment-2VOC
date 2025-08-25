import { apiService } from './api';
import { User, LoginCredentials, RegisterData, ApiResponse } from '../types';

interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

interface UserResponse {
  user: User;
}

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/login', credentials);
  }

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/register', userData);
  }

  // Get current user
  async getCurrentUser(): Promise<UserResponse> {
    return apiService.get<UserResponse>('/auth/me');
  }

  // Logout user
  async logout(): Promise<ApiResponse<null>> {
    return apiService.post<ApiResponse<null>>('/auth/logout');
  }

  // Verify token
  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    return apiService.post<{ valid: boolean; user?: User }>('/auth/verify-token');
  }

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    return apiService.post<ApiResponse<null>>('/auth/forgot-password', { email });
  }

  // Reset password
  async resetPassword(token: string, password: string): Promise<ApiResponse<null>> {
    return apiService.post<ApiResponse<null>>('/auth/reset-password', { token, password });
  }

  // Update profile
  async updateProfile(userData: Partial<User>): Promise<{ user: User; message: string }> {
    return apiService.put<{ user: User; message: string }>('/users/profile', userData);
  }

  // Update preferences
  async updatePreferences(preferences: Partial<User['preferences']>): Promise<{ preferences: User['preferences']; message: string }> {
    return apiService.put<{ preferences: User['preferences']; message: string }>('/users/preferences', preferences);
  }

  // Get user profile by username
  async getUserProfile(username: string): Promise<{ user: User }> {
    return apiService.get<{ user: User }>(`/users/profile/${username}`);
  }

  // Get user statistics
  async getUserStatistics(): Promise<{
    statistics: User['statistics'];
    statusCounts: Record<string, number>;
    scoreDistribution: Record<number, number>;
    recentActivity: any[];
  }> {
    return apiService.get('/users/statistics');
  }
}

export const authService = new AuthService();