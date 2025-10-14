'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '@/hooks/useAuth'
import LoginWithOTP from '@/components/auth/LoginWithOTP'
import PasswordReset from '@/components/auth/PasswordReset'

interface LoginFormData {
  username: string
  password: string
}

const loginSchema = yup.object().shape({
  username: yup.string().required('กรุณาระบุชื่อผู้ใช้'),
  password: yup.string().required('กรุณาระบุรหัสผ่าน'),
})

export default function OfficerLoginPage() {
  const { login, isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showLoginWithOTP, setShowLoginWithOTP] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

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

  useEffect(() => {
    // Only redirect if not loading and authenticated
    if (!isLoading && isAuthenticated) {
      // Redirect based on user role
      if (user?.role === 'admin' ||
          user?.role === 'system_admin' ||
          user?.role === 'dede_head_admin' ||
          user?.role === 'dede_staff_admin' ||
          user?.role === 'dede_consult_admin' ||
          user?.role === 'auditor_admin') {
        router.push('/admin-portal/dashboard')
      } else if (user?.role === 'dede_head' ||
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
    // Show success message
    setSuccess('เข้าสู่ระบบสำเร็จแล้ว')
  }

  const handlePasswordResetSuccess = () => {
    setShowPasswordReset(false)
    // Show success message
    setSuccess('รีเซ็ตรหัสผ่านสำเร็จแล้ว')
  }

  const handleCancelOTP = () => {
    setShowLoginWithOTP(false)
  }

  const handleCancelPasswordReset = () => {
    setShowPasswordReset(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (showLoginWithOTP) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">เข้าสู่ระบบ Web Portal</h1>
            <p className="mt-2 text-sm text-gray-600">
              กรุณากรอกรหัส OTP ที่ได้รับทางอีเมลหรือเบอร์โทรศัพท์
            </p>
          </div>
          
          <LoginWithOTP
            onSuccess={handleLoginWithOTPSuccess}
            onCancel={handleCancelOTP}
          />
        </div>
      </div>
    )
  }

  if (showPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">รีเซ็ตรหัสผ่าน</h1>
            <p className="mt-2 text-sm text-gray-600">
              กรุณากรอกข้อมูลเพื่อรีเซ็ตรหัสผ่านของคุณ
            </p>
          </div>
          
          <PasswordReset
            onSuccess={handlePasswordResetSuccess}
            onCancel={handleCancelPasswordReset}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            เข้าสู่ระบบ Web Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            สำหรับเจ้าหน้าที่ DEDE E-Service
          </p>
        </div>

        {success && (
          <div className="rounded-md bg-green-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                ชื่อผู้ใช้
              </label>
              <input
                {...register('username')}
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="ชื่อผู้ใช้"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                รหัสผ่าน
              </label>
              <input
                {...register('password')}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="รหัสผ่าน"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                จดจำฉัน
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={() => setShowPasswordReset(true)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">หรือ</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowLoginWithOTP(true)}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              เข้าสู่ระบบด้วย OTP
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            เป็นผู้ใช้งานทั่วไป?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              เข้าสู่ระบบ Web View
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}