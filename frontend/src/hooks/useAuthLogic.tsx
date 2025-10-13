'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, AuthState } from '@/types'
import { authService } from '@/lib/auth'

export interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  register: (data: any) => Promise<{ success: boolean; message?: string }>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProviderComponent({ children }: { children: ReactNode }) {
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
        if (authService.isAuthenticated()) {
          const user = authService.getCurrentUser()
          const token = authService.getToken()
          
          if (user && token) {
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
        console.error('Auth initialization error:', error)
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
      
      const response = await authService.login({ username, password })
      
      if (response.success && response.data) {
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

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
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

  const refreshProfile = async () => {
    try {
      const response = await authService.getProfile()
      
      if (response.success && response.data) {
        setAuthState(prev => ({
          ...prev,
          user: response.data || null,
        }))
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error)
    }
  }

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthLogic() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthLogic must be used within an AuthProviderComponent')
  }
  return context
}