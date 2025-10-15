'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import LoginWithOTP from '@/components/auth/LoginWithOTP'
import PasswordReset from '@/components/auth/PasswordReset'
import Link from 'next/link'

interface LoginFormData {
  username: string
  password: string
}

export default function HomePage() {
  const { login, isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showLoginWithOTP, setShowLoginWithOTP] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'admin'>('login')

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
        router.push('/eservice/dede/home')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-green-600 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-3xl">DE</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
            <span className="block">ระบบบริการอิเล็กทรอนิกส์</span>
            <span className="block text-green-100 mt-2">กรมพัฒนาพลังงานทดแทน</span>
            <span className="block text-green-100">และอนุรักษ์พลังงาน</span>
          </h1>
          <p className="text-xl text-green-50 max-w-3xl mx-auto">
            กรุณาเลือกประเภทการเข้าใช้งานระบบเพื่อดำเนินการต่อ
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-white border-opacity-20">
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center mb-8 border-b border-white border-opacity-20">
              <button
                onClick={() => setActiveTab('login')}
                className={`px-6 py-3 text-center font-medium text-sm ${
                  activeTab === 'login'
                    ? 'text-white border-b-2 border-white'
                    : 'text-green-100 hover:text-white'
                }`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`px-6 py-3 text-center font-medium text-sm ${
                  activeTab === 'register'
                    ? 'text-white border-b-2 border-white'
                    : 'text-green-100 hover:text-white'
                }`}
              >
                สมัครสมาชิก
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-6 py-3 text-center font-medium text-sm ${
                  activeTab === 'admin'
                    ? 'text-white border-b-2 border-white'
                    : 'text-green-100 hover:text-white'
                }`}
              >
                เข้าสู่ระบบผู้ดูแล
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'login' && (
              <div className="max-w-md mx-auto">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
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
                  
                  {success && (
                    <div className="rounded-md bg-green-50 p-4">
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
                  
                  <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                      <label htmlFor="username" className="sr-only">
                        ชื่อผู้ใช้
                      </label>
                      <input
                        {...register('username', { required: 'กรุณาระบุชื่อผู้ใช้' })}
                        type="text"
                        autoComplete="username"
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
                        {...register('password', { required: 'กรุณาระบุรหัสผ่าน' })}
                        type="password"
                        autoComplete="current-password"
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="รหัสผ่าน"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
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
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-green-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-transparent text-green-100">หรือ</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setShowLoginWithOTP(true)}
                        className="w-full flex justify-center py-2 px-4 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        เข้าสู่ระบบด้วย OTP
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setShowPasswordReset(true)}
                        className="w-full flex justify-center py-2 px-4 text-sm font-medium text-white hover:text-green-100"
                      >
                        ลืมรหัสผ่าน?
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'register' && (
              <div className="text-center">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-semibold text-white mb-4">สมัครสมาชิกใหม่</h3>
                  <p className="text-green-100 mb-6">
                    สำหรับผู้ใช้งานใหม่ที่ต้องการสมัครใช้งานระบบ
                  </p>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    ไปที่หน้าสมัครสมาชิก
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="text-center">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-semibold text-white mb-4">เข้าสู่ระบบผู้ดูแล</h3>
                  <p className="text-green-100 mb-6">
                    สำหรับเจ้าหน้าที่และผู้ดูแลระบบ
                  </p>
                  <Link
                    href="/admin-portal"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                  >
                    ไปที่หน้าเข้าสู่ระบบผู้ดูแล
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}