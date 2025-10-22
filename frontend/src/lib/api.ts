import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse } from '@/types'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          // Check for portal token first for portal-specific routes
          const isPortalRoute = config.url?.includes('/admin-portal') ||
                               config.url?.includes('/officer') ||
                               window.location.pathname.startsWith('/admin-portal') ||
                               window.location.pathname.startsWith('/eservice/dede/officer') ||
                               window.location.pathname.startsWith('/web-portal') ||
                               window.location.pathname.startsWith('/eservice/dede')
          
          const tokenKey = isPortalRoute ? 'portal_token' : 'token'
          const token = localStorage.getItem(tokenKey)
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle common errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Token expired or invalid
          if (typeof window !== 'undefined') {
            // Determine which token to use based on the current route
            const isPortalRoute = window.location.pathname.startsWith('/admin-portal') ||
                                 window.location.pathname.startsWith('/eservice/dede/officer') ||
                                 window.location.pathname.startsWith('/web-portal') ||
                                 window.location.pathname.startsWith('/eservice/dede')
            
            const tokenKey = isPortalRoute ? 'portal_token' : 'token'
            const refreshTokenKey = isPortalRoute ? 'portal_refreshToken' : 'refreshToken'
            const userKey = isPortalRoute ? 'portal_user' : 'user'
            
            const refreshToken = localStorage.getItem(refreshTokenKey)
            
            if (refreshToken && !originalRequest._retry) {
              originalRequest._retry = true
              
              try {
                // Try to refresh the token
                const response = await axios.post(`${this.client.defaults.baseURL}/api/v1/auth/refresh-token`, {
                  refresh_token: refreshToken
                })
                
                if (response.data.success && response.data.data) {
                  const newToken = response.data.data.access_token
                  const newRefreshToken = response.data.data.refresh_token
                  localStorage.setItem(tokenKey, newToken)
                  localStorage.setItem(refreshTokenKey, newRefreshToken)
                  
                  // Retry the original request with the new token
                  originalRequest.headers.Authorization = `Bearer ${newToken}`
                  return this.client(originalRequest)
                }
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError)
              }
            }
            
            // If we can't refresh the token, clear storage and redirect
            localStorage.removeItem(tokenKey)
            localStorage.removeItem(refreshTokenKey)
            localStorage.removeItem(userKey)
            
            // Only redirect if not on authentication pages to avoid unwanted redirects
            // Don't redirect on login, home page, or register pages
            const authPages = ['/login', '/', '/register', '/reset-password', '/invite']
            if (!authPages.includes(window.location.pathname)) {
              window.location.href = isPortalRoute ? '/' : '/'
            }
          }
        }
        
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.patch(url, data, config)
    return response.data
  }

  // File upload method
  async upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    }

    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, formData, config)
    return response.data
  }
}

export const apiClient = new ApiClient()