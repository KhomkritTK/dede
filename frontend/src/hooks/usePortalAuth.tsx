'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  AuthState,
  LoginWithOTPCredentials,
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
  VerifyOTPResponse
} from '@/types'
import { authService } from '@/lib/auth'

export interface PortalAuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  loginWithOTP: (credentials: LoginWithOTPCredentials) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  register: (data: any) => Promise<{ success: boolean; message?: string }>
  registerWithOTP: (data: RegisterWithOTPData) => Promise<{ success: boolean; message?: string }>
  registerCorporate: (data: CorporateRegisterData) => Promise<{ success: boolean; message?: string }>
  acceptInvitation: (data: AcceptInvitationData) => Promise<{ success: boolean; message?: string }>
  registerCorporateMember: (data: RegisterCorporateMemberData) => Promise<{ success: boolean; message?: string }>
  refreshProfile: () => Promise<void>
  changePassword: (data: ChangePasswordData) => Promise<{ success: boolean; message?: string }>
  forgotPassword: (data: ForgotPasswordData) => Promise<{ success: boolean; message?: string }>
  resetPassword: (data: ResetPasswordData) => Promise<{ success: boolean; message?: string }>
  sendOTP: (data: SendOTPData) => Promise<{ success: boolean; message?: string }>
  verifyOTP: (data: VerifyOTPData) => Promise<{ success: boolean; message?: string; data?: VerifyOTPResponse }>
  resendOTP: (data: ResendOTPData) => Promise<{ success: boolean; message?: string }>
  verifyRegistrationOTP: (data: VerifyOTPData) => Promise<{ success: boolean; message?: string }>
  verifyCorporateOTP: (data: VerifyOTPData) => Promise<{ success: boolean; message?: string }>
}

export const PortalAuthContext = createContext<PortalAuthContextType | undefined>(undefined)

// Storage keys for portal authentication
const PORTAL_TOKEN_KEY = 'portal_token'
const PORTAL_REFRESH_TOKEN_KEY = 'portal_refreshToken'
const PORTAL_USER_KEY = 'portal_user'

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    // Check if user is already authenticated on app load
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem(PORTAL_TOKEN_KEY)
          const userStr = localStorage.getItem(PORTAL_USER_KEY)
          
          if (token && userStr) {
            const user = JSON.parse(userStr)
            
            setAuthState({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            })
            
            // Try to refresh profile from server but don't fail if it doesn't work
            try {
              await refreshProfile()
            } catch (profileError) {
              console.warn('Failed to refresh profile during init, but continuing with local data:', profileError)
            }
          } else {
            // Invalid token or user data
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } else {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error('Portal auth initialization error:', error)
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    }

    initAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const response = await authService.login({ username, password, login_type: 'web_portal' })
      
      if (response.success && response.data) {
        // Store portal-specific tokens
        if (typeof window !== 'undefined') {
          localStorage.setItem(PORTAL_TOKEN_KEY, response.data.token)
          localStorage.setItem(PORTAL_REFRESH_TOKEN_KEY, response.data.token) // Using same token for simplicity
          localStorage.setItem(PORTAL_USER_KEY, JSON.stringify(response.data.user))
        }
        
        setAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        })
        
        return { success: true }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, message: response.message || 'Login failed' }
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed' 
      }
    }
  }

  const loginWithOTP = async (credentials: LoginWithOTPCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const response = await authService.loginWithOTP(credentials, 'web_portal')
      
      if (response.success && response.data) {
        // Store portal-specific tokens
        if (typeof window !== 'undefined') {
          localStorage.setItem(PORTAL_TOKEN_KEY, response.data.token)
          localStorage.setItem(PORTAL_REFRESH_TOKEN_KEY, response.data.token) // Using same token for simplicity
          localStorage.setItem(PORTAL_USER_KEY, JSON.stringify(response.data.user))
        }
        
        setAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        })
        
        return { success: true }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, message: response.message || 'Login with OTP failed' }
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login with OTP failed'
      }
    }
  }

  const logout = async () => {
    try {
      await authService.logout('web_portal')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear portal-specific tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem(PORTAL_TOKEN_KEY)
        localStorage.removeItem(PORTAL_REFRESH_TOKEN_KEY)
        localStorage.removeItem(PORTAL_USER_KEY)
      }
      
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  const register = async (data: any) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const response = await authService.register(data)
      
      if (response.success && response.data) {
        // Store portal-specific tokens
        if (typeof window !== 'undefined') {
          localStorage.setItem(PORTAL_TOKEN_KEY, response.data.token)
          localStorage.setItem(PORTAL_REFRESH_TOKEN_KEY, response.data.token) // Using same token for simplicity
          localStorage.setItem(PORTAL_USER_KEY, JSON.stringify(response.data.user))
        }
        
        setAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        })
        
        return { success: true }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, message: response.message || 'Registration failed' }
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Registration failed' 
      }
    }
  }

  const registerWithOTP = async (data: RegisterWithOTPData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const response = await authService.registerWithOTP(data)
      
      if (response.success && response.data) {
        // Store portal-specific tokens
        if (typeof window !== 'undefined') {
          localStorage.setItem(PORTAL_TOKEN_KEY, response.data.token)
          localStorage.setItem(PORTAL_REFRESH_TOKEN_KEY, response.data.token) // Using same token for simplicity
          localStorage.setItem(PORTAL_USER_KEY, JSON.stringify(response.data.user))
        }
        
        setAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        })
        
        return { success: true }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, message: response.message || 'Registration with OTP failed' }
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration with OTP failed'
      }
    }
  }

  const registerCorporate = async (data: CorporateRegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const response = await authService.registerCorporate(data)
      
      setAuthState(prev => ({ ...prev, isLoading: false }))
      
      if (response.success) {
        return { success: true, message: response.message || 'Corporate registration initiated successfully' }
      } else {
        return { success: false, message: response.message || 'Corporate registration failed' }
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Corporate registration failed'
      }
    }
  }

  const acceptInvitation = async (data: AcceptInvitationData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const response = await authService.acceptInvitation(data)
      
      if (response.success && response.data) {
        // Store portal-specific tokens
        if (typeof window !== 'undefined') {
          localStorage.setItem(PORTAL_TOKEN_KEY, response.data.token)
          localStorage.setItem(PORTAL_REFRESH_TOKEN_KEY, response.data.token) // Using same token for simplicity
          localStorage.setItem(PORTAL_USER_KEY, JSON.stringify(response.data.user))
        }
        
        setAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        })
        
        return { success: true }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, message: response.message || 'Invitation acceptance failed' }
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Invitation acceptance failed'
      }
    }
  }

  const registerCorporateMember = async (data: RegisterCorporateMemberData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const response = await authService.registerCorporateMember(data)
      
      setAuthState(prev => ({ ...prev, isLoading: false }))
      
      if (response.success) {
        return { success: true, message: response.message || 'Corporate member registered successfully' }
      } else {
        return { success: false, message: response.message || 'Corporate member registration failed' }
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Corporate member registration failed'
      }
    }
  }

  const refreshProfile = async () => {
    try {
      // Use the portal-specific getProfile method
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(PORTAL_TOKEN_KEY)}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          // Update portal-specific user data
          if (typeof window !== 'undefined') {
            localStorage.setItem(PORTAL_USER_KEY, JSON.stringify(data.data))
          }
          
          setAuthState(prev => ({
            ...prev,
            user: data.data || null,
          }))
        }
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error)
    }
  }

  const changePassword = async (data: ChangePasswordData) => {
    try {
      const response = await authService.changePassword(data)
      
      if (response.success) {
        return { success: true, message: response.message || 'Password changed successfully' }
      } else {
        return { success: false, message: response.message || 'Password change failed' }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Password change failed'
      }
    }
  }

  const forgotPassword = async (data: ForgotPasswordData) => {
    try {
      const response = await authService.forgotPassword(data)
      
      if (response.success) {
        return { success: true, message: response.message || 'Password reset email sent' }
      } else {
        return { success: false, message: response.message || 'Failed to send password reset email' }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to send password reset email'
      }
    }
  }

  const resetPassword = async (data: ResetPasswordData) => {
    try {
      const response = await authService.resetPassword(data)
      
      if (response.success) {
        return { success: true, message: response.message || 'Password reset successfully' }
      } else {
        return { success: false, message: response.message || 'Password reset failed' }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Password reset failed'
      }
    }
  }

  const sendOTP = async (data: SendOTPData) => {
    try {
      const response = await authService.sendOTP(data)
      
      if (response.success) {
        return { success: true, message: response.message || 'OTP sent successfully' }
      } else {
        return { success: false, message: response.message || 'Failed to send OTP' }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to send OTP'
      }
    }
  }

  const verifyOTP = async (data: VerifyOTPData) => {
    try {
      const response = await authService.verifyOTP(data)
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'OTP verified successfully',
          data: response.data
        }
      } else {
        return { success: false, message: response.message || 'OTP verification failed' }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'OTP verification failed'
      }
    }
  }

  const resendOTP = async (data: ResendOTPData) => {
    try {
      const response = await authService.resendOTP(data)
      
      if (response.success) {
        return { success: true, message: response.message || 'OTP resent successfully' }
      } else {
        return { success: false, message: response.message || 'Failed to resend OTP' }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to resend OTP'
      }
    }
  }

  const verifyRegistrationOTP = async (data: VerifyOTPData) => {
    try {
      const response = await authService.verifyRegistrationOTP(data)
      
      if (response.success) {
        return { success: true, message: response.message || 'Registration OTP verified successfully' }
      } else {
        return { success: false, message: response.message || 'Registration OTP verification failed' }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration OTP verification failed'
      }
    }
  }

  const verifyCorporateOTP = async (data: VerifyOTPData) => {
    try {
      const response = await authService.verifyCorporateOTP(data)
      
      if (response.success) {
        return { success: true, message: response.message || 'Corporate OTP verified successfully' }
      } else {
        return { success: false, message: response.message || 'Corporate OTP verification failed' }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Corporate OTP verification failed'
      }
    }
  }

  const value: PortalAuthContextType = {
    ...authState,
    login,
    loginWithOTP,
    logout,
    register,
    registerWithOTP,
    registerCorporate,
    acceptInvitation,
    registerCorporateMember,
    refreshProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    sendOTP,
    verifyOTP,
    resendOTP,
    verifyRegistrationOTP,
    verifyCorporateOTP,
  }

  return (
    <PortalAuthContext.Provider value={value}>
      {children}
    </PortalAuthContext.Provider>
  )
}

export function usePortalAuth(): PortalAuthContextType {
  const context = useContext(PortalAuthContext)
  if (context === undefined) {
    throw new Error('usePortalAuth must be used within a PortalAuthProvider')
  }
  return context
}