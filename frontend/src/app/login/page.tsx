'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import LoginWithOTP from '@/components/auth/LoginWithOTP'
import PasswordReset from '@/components/auth/PasswordReset'

interface LoginFormData {
  username: string
  password: string
}

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showLoginWithOTP, setShowLoginWithOTP] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)

  useEffect(() => {
    // Get message from URL params
    const msg = searchParams.get('message')
    if (msg) {
      switch (msg) {
        case 'password_reset':
          setSuccess('รีเซ็ตรหัสผ่านสำเร็จแล้ว กรุณาเข้าสู่ระบบใหม่')
          break
        case 'invitation_accepted':
          setSuccess('ยอมรับคำเชิญสำเร็จแล้ว กรุณาเข้าสู่ระบบ')
          break
        case 'registration_success':
          setSuccess('สมัครสมาชิกสำเร็จแล้ว กรุณาเข้าสู่ระบบ')
          break
        case 'logout':
          setSuccess('ออกจากระบบสำเร็จแล้ว')
          break
        default:
          setSuccess(null)
      }
    }
  }, [searchParams])
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  useEffect(() => {
    // Only redirect if not loading and authenticated
    if (!isLoading && isAuthenticated) {
      // Redirect based on user role
      if (user?.role === 'admin' ||
          user?.role === 'dede_head' ||
          user?.role === 'dede_staff' ||
          user?.role === 'dede_consult' ||
          user?.role === 'auditor') {
        router.push('/eservice/dede/officer/dashboard')
      } else {
        router.push('/eservice/dede')
      }
    }
  }, [isAuthenticated, isLoading, router, user])

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    setSuccess(null)
    
    const result = await login(data.username, data.password)
    
    if (!result.success) {
      setError(result.message || 'Login failed')
    }
  }

  const handleLoginWithOTPSuccess = () => {
    setShowLoginWithOTP(false)
    // The auth context will handle the redirect
  }

  const handlePasswordResetSuccess = () => {
    setShowPasswordReset(false)
    // Show success message and redirect to login
    setError(null)
  }

  if (showLoginWithOTP) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <LoginWithOTP
            onSuccess={handleLoginWithOTPSuccess}
            onCancel={() => setShowLoginWithOTP(false)}
          />
        </div>
      </div>
    )
  }

  if (showPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <PasswordReset
            onSuccess={handlePasswordResetSuccess}
            onCancel={() => setShowPasswordReset(false)}
          />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            เข้าสู่ระบบ DEDE E-Service
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            ระบบบริการอิเล็กทรอนิกส์ กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-danger-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-danger-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-danger-800">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                ชื่อผู้ใช้
              </label>
              <input
                {...register('username', { required: 'กรุณาระบุชื่อผู้ใช้' })}
                type="text"
                autoComplete="username"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="ชื่อผู้ใช้"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-danger-600">{errors.username.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                รหัสผ่าน
              </label>
              <input
                {...register('password', { required: 'กรุณาระบุรหัสผ่าน' })}
                type="password"
                autoComplete="current-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="รหัสผ่าน"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-secondary-600">
                ยังไม่มีบัญชี?{' '}
                <a href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  สมัครสมาชิก
                </a>
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-secondary-50 text-secondary-500">หรือ</span>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-sm text-secondary-600 mb-2 text-center">สแกน QR Code เพื่อเข้าสู่ระบบ</p>
                <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-xs">QR Code</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowLoginWithOTP(true)}
                className="w-full flex justify-center py-2 px-4 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                เข้าสู่ระบบด้วย OTP
              </button>
              
              <button
                type="button"
                onClick={() => setShowPasswordReset(true)}
                className="w-full flex justify-center py-2 px-4 text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-secondary-600">
                เป็นเจ้าหน้าที่?{' '}
                <a href="/login-portal" className="font-medium text-primary-600 hover:text-primary-500">
                  เข้าสู่ระบบ Web Portal
                </a>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}