import { apiClient } from './api'
import {
  User,
  LoginCredentials,
  LoginWithOTPCredentials,
  RegisterData,
  RegisterWithOTPData,
  CorporateRegisterData,
  AcceptInvitationData,
  RegisterCorporateMemberData,
  SendOTPData,
  VerifyOTPData,
  ResendOTPData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  VerifyOTPResponse,
  ApiResponse
} from '@/types'

export class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiClient.post<{ user: User; access_token: string; refresh_token: string }>('/api/v1/auth/login', credentials)
    
    if (response.success && response.data) {
      // Determine storage keys based on login type
      const loginType = credentials.login_type || 'web_view'
      const tokenKey = loginType === 'web_portal' ? 'portal_token' : 'token'
      const refreshTokenKey = loginType === 'web_portal' ? 'portal_refreshToken' : 'refreshToken'
      const userKey = loginType === 'web_portal' ? 'portal_user' : 'user'
      
      // Store token and user in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(tokenKey, response.data.access_token)
        localStorage.setItem(refreshTokenKey, response.data.refresh_token)
        localStorage.setItem(userKey, JSON.stringify(response.data.user))
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

  async loginWithOTP(credentials: LoginWithOTPCredentials, loginType: string = 'web_view'): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiClient.post<{ user: User; access_token: string; refresh_token: string }>('/api/v1/auth/login-otp', credentials)
    
    if (response.success && response.data) {
      // Determine storage keys based on login type
      const tokenKey = loginType === 'web_portal' ? 'portal_token' : 'token'
      const refreshTokenKey = loginType === 'web_portal' ? 'portal_refreshToken' : 'refreshToken'
      const userKey = loginType === 'web_portal' ? 'portal_user' : 'user'
      
      // Store token and user in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(tokenKey, response.data.access_token)
        localStorage.setItem(refreshTokenKey, response.data.refresh_token)
        localStorage.setItem(userKey, JSON.stringify(response.data.user))
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

  async logout(loginType: string = 'web_view'): Promise<void> {
    try {
      await apiClient.post('/api/v1/auth/logout')
    } catch (error) {
      // Even if the API call fails, we should clear local storage
      console.error('Logout API call failed:', error)
    } finally {
      // Clear token and user from localStorage based on login type
      if (typeof window !== 'undefined') {
        const tokenKey = loginType === 'web_portal' ? 'portal_token' : 'token'
        const refreshTokenKey = loginType === 'web_portal' ? 'portal_refreshToken' : 'refreshToken'
        const userKey = loginType === 'web_portal' ? 'portal_user' : 'user'
        
        localStorage.removeItem(tokenKey)
        localStorage.removeItem(refreshTokenKey)
        localStorage.removeItem(userKey)
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

  async registerWithOTP(data: RegisterWithOTPData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiClient.post<{ user: User; access_token: string; refresh_token: string }>('/api/v1/auth/register-otp', data)
    
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

  async registerCorporate(data: CorporateRegisterData): Promise<ApiResponse<void>> {
    return await apiClient.post<void>('/api/v1/auth/register-corporate', data)
  }

  async acceptInvitation(data: AcceptInvitationData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiClient.post<{ user: User; access_token: string; refresh_token: string }>('/api/v1/auth/accept-invitation', data)
    
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

  async registerCorporateMember(data: RegisterCorporateMemberData): Promise<ApiResponse<void>> {
    return await apiClient.post<void>('/api/v1/auth/register-corporate-member', data)
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await apiClient.post<{ access_token: string; refresh_token: string }>('/api/v1/auth/refresh-token', {
      refresh_token: this.getRefreshToken()
    })
    
    if (response.success && response.data) {
      // Update tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('refreshToken', response.data.refresh_token)
      }
      
      // Transform response to match expected format
      return {
        success: response.success,
        message: response.message,
        data: {
          token: response.data.access_token
        }
      }
    }
    
    // Return error response with correct type
    return {
      success: response.success,
      message: response.message
    }
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

  async changePassword(data: ChangePasswordData): Promise<ApiResponse<void>> {
    return await apiClient.put<void>('/api/v1/auth/password', data)
  }

  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse<void>> {
    return await apiClient.post<void>('/api/v1/auth/forgot-password', data)
  }

  async resetPassword(data: ResetPasswordData): Promise<ApiResponse<void>> {
    return await apiClient.post<void>('/api/v1/auth/reset-password', data)
  }

  // OTP methods
  async sendOTP(data: SendOTPData): Promise<ApiResponse<void>> {
    return await apiClient.post<void>('/api/v1/otp/send', data)
  }

  async verifyOTP(data: VerifyOTPData): Promise<ApiResponse<VerifyOTPResponse>> {
    return await apiClient.post<VerifyOTPResponse>('/api/v1/otp/verify', data)
  }

  async resendOTP(data: ResendOTPData): Promise<ApiResponse<void>> {
    return await apiClient.post<void>('/api/v1/otp/resend', data)
  }

  async verifyRegistrationOTP(data: VerifyOTPData): Promise<ApiResponse<void>> {
    return await apiClient.post<void>('/api/v1/auth/verify-registration-otp', data)
  }

  async verifyCorporateOTP(data: VerifyOTPData): Promise<ApiResponse<void>> {
    return await apiClient.post<void>('/api/v1/auth/verify-corporate-otp', data)
  }

  // Utility methods
  isAuthenticated(loginType: string = 'web_view'): boolean {
    if (typeof window === 'undefined') return false
    const tokenKey = loginType === 'web_portal' ? 'portal_token' : 'token'
    const token = localStorage.getItem(tokenKey)
    return !!token
  }

  getCurrentUser(loginType: string = 'web_view'): User | null {
    if (typeof window === 'undefined') return null
    const userKey = loginType === 'web_portal' ? 'portal_user' : 'user'
    const userStr = localStorage.getItem(userKey)
    return userStr ? JSON.parse(userStr) : null
  }

  getToken(loginType: string = 'web_view'): string | null {
    if (typeof window === 'undefined') return null
    const tokenKey = loginType === 'web_portal' ? 'portal_token' : 'token'
    return localStorage.getItem(tokenKey)
  }

  getRefreshToken(loginType: string = 'web_view'): string | null {
    if (typeof window === 'undefined') return null
    const refreshTokenKey = loginType === 'web_portal' ? 'portal_refreshToken' : 'refreshToken'
    return localStorage.getItem(refreshTokenKey)
  }
}

export const authService = new AuthService()