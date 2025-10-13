import { apiClient } from './api'
import { User, LoginCredentials, RegisterData, ApiResponse } from '@/types'

export class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiClient.post<{ user: User; access_token: string; refresh_token: string }>('/api/v1/auth/login', credentials)
    
    if (response.success && response.data) {
      // Store token and user in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('refreshToken', response.data.refresh_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      // Transform the response to match the expected format
      const transformedResponse: ApiResponse<{ user: User; token: string }> = {
        success: response.success,
        message: response.message,
        data: {
          user: response.data.user,
          token: response.data.access_token
        }
      }
      
      return transformedResponse
    }
    
    // Return error response as is
    return {
      success: response.success,
      message: response.message
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/auth/logout')
    } catch (error) {
      // Even if the API call fails, we should clear local storage
      console.error('Logout API call failed:', error)
    } finally {
      // Clear token and user from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registerData } = data
    const response = await apiClient.post<{ user: User; access_token: string; refresh_token: string }>('/api/v1/auth/register', registerData)
    
    if (response.success && response.data) {
      // Store token and user in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('refreshToken', response.data.refresh_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      // Transform the response to match the expected format
      const transformedResponse: ApiResponse<{ user: User; token: string }> = {
        success: response.success,
        message: response.message,
        data: {
          user: response.data.user,
          token: response.data.access_token
        }
      }
      
      return transformedResponse
    }
    
    // Return error response as is
    return {
      success: response.success,
      message: response.message
    }
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await apiClient.post<{ token: string }>('/api/v1/auth/refresh')
    
    if (response.success && response.data) {
      // Update token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token)
      }
    }
    
    return response
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return await apiClient.get<User>('/api/v1/auth/profile')
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await apiClient.put<User>('/api/v1/auth/profile', data)
    
    if (response.success && response.data) {
      // Update user in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data))
      }
    }
    
    return response
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    return await apiClient.put<void>('/api/v1/auth/password', data)
  }

  // Utility methods
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('token')
    return !!token
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }
}

export const authService = new AuthService()