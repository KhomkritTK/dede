'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '@/hooks/useAuth'
import { usePortalAuth } from '@/hooks/usePortalAuth'
import LoginWithOTP from '@/components/auth/LoginWithOTP'
import PasswordReset from '@/components/auth/PasswordReset'
import CorporateRegistration from '@/components/auth/CorporateRegistration'
import { RegisterData } from '@/types'
import Link from 'next/link'

interface LoginFormData {
  username: string
  password: string
}

// Validation schema for registration
const registerSchema = yup.object().shape({
  username: yup.string().required('กรุณาระบุชื่อผู้ใช้').min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'),
  email: yup.string().required('กรุณาระบุอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: yup.string().required('กรุณาระบุรหัสผ่าน').min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  confirmPassword: yup.string().required('กรุณายืนยันรหัสผ่าน').oneOf([yup.ref('password')], 'รหัสผ่านไม่ตรงกัน'),
  fullName: yup.string().required('กรุณาระบุชื่อ-นามสกุล'),
  phone: yup.string(),
  company: yup.string(),
  address: yup.string(),
})

// Validation schema for officer login
const officerLoginSchema = yup.object().shape({
  username: yup.string().required('กรุณาระบุชื่อผู้ใช้'),
  password: yup.string().required('กรุณาระบุรหัสผ่าน'),
})

export default function HomePage() {
  const { login, register: registerUser, logout, isAuthenticated, isLoading, user } = useAuth()
  const { login: portalLogin, logout: portalLogout, isAuthenticated: isPortalAuth, isLoading: isPortalLoading, user: portalUser } = usePortalAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showLoginWithOTP, setShowLoginWithOTP] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [showCorporateRegistration, setShowCorporateRegistration] = useState(false)
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'officer'>('login')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationError, setRegistrationError] = useState<string | null>(null)
  const [officerError, setOfficerError] = useState<string | null>(null)
  const [officerSuccess, setOfficerSuccess] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>()
  
  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegisterForm,
  } = useForm<RegisterData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
      company: '',
      address: '',
    },
  })
  
  const {
    register: registerOfficer,
    handleSubmit: handleOfficerSubmit,
    formState: { errors: officerErrors },
    reset: resetOfficerForm,
  } = useForm<LoginFormData>({
    resolver: yupResolver(officerLoginSchema),
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

  // Check if user is trying to login with wrong form
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const officerRoles = [
        'admin', 'system_admin', 'dede_head_admin', 'dede_staff_admin', 'dede_consult_admin', 'auditor_admin',
        'dede_head', 'dede_staff', 'dede_consult', 'auditor'
      ]
      
      // Check for redirect parameter
      const redirectParam = searchParams.get('redirect')
      
      // If user is redirected to web-view, redirect to eservice home instead
      if (redirectParam === 'web-view') {
        setTimeout(() => {
          router.push('/eservice/dede/home')
        }, 1000)
        return
      }
      
      // If user is redirected to web-view/admin-portal, handle accordingly
      if (redirectParam === 'web-view/admin-portal') {
        setTimeout(() => {
          router.push('/admin-portal')
        }, 1000)
        return
      }
      
      // If user is an officer/admin but logged in through regular login tab
      if (activeTab === 'login' && officerRoles.includes(user.role)) {
        // Instead of logging out, redirect admin users to the appropriate dashboard
        setTimeout(() => {
          router.push('/admin-portal/dashboard')
        }, 1000)
        return
      }
      
      // If user is a regular user but logged in through officer login tab
      if (activeTab === 'officer' && !officerRoles.includes(user.role)) {
        setTimeout(async () => {
          await logout()
          setOfficerError('บัญชีนี้ไม่มีสิทธิเข้าใช้งานในฐานะเจ้าหน้าที่ กรุณาใช้แท็บเข้าสู่ระบบทั่วไป')
        }, 500)
        return
      }
      
      // Don't auto-redirect - let users choose which system to access
      // Users can access both systems independently from this landing page
    }
  }, [isAuthenticated, isLoading, router, user, activeTab, searchParams])

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    setSuccess(null)
    
    // For Web View login, always use portal auth
    const result = await portalLogin(data.username, data.password)
    
    if (!result.success) {
      setError(result.message || 'Login failed')
    } else {
      // Show success message and redirect to eservice home
      setSuccess('เข้าสู่ระบบสำเร็จแล้ว')
      setTimeout(() => {
        router.push('/eservice/dede/home')
      }, 1000)
    }
  }

  const onRegisterSubmit = async (data: RegisterData) => {
    setRegistrationError(null)
    setIsSubmitting(true)
    
    try {
      const result = await registerUser(data)
      
      if (!result.success) {
        setRegistrationError(result.message || 'สมัครสมาชิกไม่สำเร็จ')
      } else {
        // Show success message and switch to login tab
        setSuccess('สมัครสมาชิกสำเร็จแล้ว กรุณาเข้าสู่ระบบ')
        setActiveTab('login')
        resetRegisterForm()
      }
    } catch (err: any) {
      setRegistrationError(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onOfficerSubmit = async (data: LoginFormData) => {
    setOfficerError(null)
    setOfficerSuccess(null)
    
    const result = await portalLogin(data.username, data.password)
    
    if (!result.success) {
      setOfficerError(result.message || 'Login failed')
    } else {
      // Show success message and redirect
      setOfficerSuccess('เข้าสู่ระบบสำเร็จแล้ว')
      
      // Check for redirect parameter
      const redirectParam = searchParams.get('redirect')
      if (redirectParam === 'web-view') {
        setTimeout(() => {
          router.push('/eservice/dede/home')
        }, 1000)
      } else if (redirectParam === 'web-view/admin-portal') {
        setTimeout(() => {
          router.push('/admin-portal')
        }, 1000)
      } else {
        setTimeout(() => {
          router.push('/admin-portal')
        }, 1000)
      }
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

  const handleCorporateRegistrationSuccess = () => {
    setShowCorporateRegistration(false)
    // Show success message and switch to login tab
    setSuccess('สมัครสมาชิกนิติบุคคลสำเร็จแล้ว กรุณาเข้าสู่ระบบ')
    setActiveTab('login')
  }

  const handleOfficerLoginWithOTPSuccess = () => {
    setShowLoginWithOTP(false)
    // Show success message
    setOfficerSuccess('เข้าสู่ระบบสำเร็จแล้ว')
  }

  const handleOfficerPasswordResetSuccess = () => {
    setShowPasswordReset(false)
    // Show success message
    setOfficerSuccess('รีเซ็ตรหัสผ่านสำเร็จแล้ว')
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

  if (showCorporateRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full">
          <CorporateRegistration
            onSuccess={handleCorporateRegistrationSuccess}
            onCancel={() => setShowCorporateRegistration(false)}
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
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
              <span className="text-white font-bold text-2xl">DE</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-3">
            <span className="block">ระบบบริการอิเล็กทรอนิกส์</span>
            <span className="block text-green-100 mt-1">กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน</span>
          </h1>
          <p className="text-lg text-green-50 max-w-2xl mx-auto">
            เลือกระบบที่เหมาะสมกับการใช้งานของคุณ
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* System Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Web View Card */}
            <div className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
              activeTab === 'login' || activeTab === 'register'
                ? 'ring-4 ring-blue-400 ring-opacity-50 transform scale-105'
                : 'hover:shadow-3xl hover:transform hover:scale-102'
            }`}>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                <div className="text-center">
                  <div className="h-12 w-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm mx-auto mb-3">
                    <span className="text-white font-bold text-xl">WV</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Web View</h2>
                  <p className="text-blue-100 text-sm">สำหรับผู้ขอใบอนุญาตและผู้ใช้งานทั่วไป</p>
                </div>
              </div>
              
              <div className="p-6 bg-white">
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === 'login'
                        ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🚪 เข้าสู่ระบบ
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === 'register'
                        ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📝 สมัครสมาชิกใหม่
                  </button>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 text-center">
                    <span className="font-semibold">เหมาะสำหรับ:</span> ผู้ที่ต้องการขอรับใบอนุญาต ต่ออายุ ขยาย หรือลดการผลิต
                  </p>
                </div>
              </div>
            </div>

            {/* Web Portal Card */}
            <div className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
              activeTab === 'officer'
                ? 'ring-4 ring-green-400 ring-opacity-50 transform scale-105'
                : 'hover:shadow-3xl hover:transform hover:scale-102'
            }`}>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
                <div className="text-center">
                  <div className="h-12 w-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm mx-auto mb-3">
                    <span className="text-white font-bold text-xl">WP</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Web Portal</h2>
                  <p className="text-green-100 text-sm">สำหรับเจ้าหน้าที่ DEDE E-Service</p>
                </div>
              </div>
              
              <div className="p-6 bg-white">
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('officer')}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === 'officer'
                        ? 'bg-green-600 text-white shadow-lg hover:bg-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    👨‍💼 เข้าสู่ระบบเจ้าหน้าที่
                  </button>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700 text-center">
                    <span className="font-semibold">เหมาะสำหรับ:</span> เจ้าหน้าที่ที่ตรวจสอบและอนุมัติคำขอใบอนุญาต
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Login Forms Container */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">

            {/* Tab Content - Web View Login */}
            {activeTab === 'login' && (
              <div className="max-w-md mx-auto p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center h-12 w-12 bg-blue-100 rounded-full mb-4">
                    <span className="text-blue-600 text-xl">🚪</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">เข้าสู่ระบบ Web View</h3>
                  <p className="text-gray-600">สำหรับผู้ขอใบอนุญาตและผู้ใช้งานทั่วไป</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  {error && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <span className="text-red-400 text-lg">⚠️</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {success && (
                    <div className="rounded-md bg-green-50 border border-green-200 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <span className="text-green-400 text-lg">✅</span>
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
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">หรือ</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setShowLoginWithOTP(true)}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        📱 เข้าสู่ระบบด้วย OTP
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setShowPasswordReset(true)}
                        className="w-full flex justify-center py-2 px-4 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                      >
                        🔑 ลืมรหัสผ่าน?
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Tab Content - Web View Registration */}
            {activeTab === 'register' && (
              <div className="max-w-md mx-auto p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center h-12 w-12 bg-blue-100 rounded-full mb-4">
                    <span className="text-blue-600 text-xl">📝</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">สมัครสมาชิก Web View</h3>
                  <p className="text-gray-600">สำหรับผู้ขอใบอนุญาตและผู้ใช้งานทั่วไป</p>
                </div>
                
                {/* Registration Type Selection */}
                <div className="space-y-4 mb-6">
                  <div className="rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">👤 บุคคลธรรมดา</h4>
                        <p className="text-sm text-gray-600">สำหรับผู้ขอใบอนุญาตรายบุคคล</p>
                      </div>
                      <button
                        onClick={() => {/* Continue with individual registration */}}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        เลือก
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">🏢 นิติบุคคล</h4>
                        <p className="text-sm text-gray-600">สำหรับบริษัท ห้างหุ้นส่วน หรือองค์กร</p>
                      </div>
                      <button
                        onClick={() => setShowCorporateRegistration(true)}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        เลือก
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">หรือกรอกแบบฟอร์มด้านล่าง</span>
                  </div>
                </div>
                
                {/* Individual Registration Form */}
                <form className="space-y-4" onSubmit={handleRegisterSubmit(onRegisterSubmit)}>
                  {registrationError && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <span className="text-red-400 text-lg">⚠️</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{registrationError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อ-นามสกุล
                    </label>
                    <input
                      {...registerForm('fullName')}
                      type="text"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="กรอกชื่อและนามสกุลของคุณ"
                    />
                    {registerErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.fullName.message as string}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      อีเมล
                    </label>
                    <input
                      {...registerForm('email')}
                      type="email"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="กรอกอีเมลของคุณ"
                    />
                    {registerErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.email.message as string}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      เบอร์โทรศัพท์ (ไม่จำเป็น)
                    </label>
                    <input
                      {...registerForm('phone')}
                      type="tel"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="กรอกเบอร์โทรศัพท์ของคุณ"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      บริษัท/หน่วยงาน (ไม่จำเป็น)
                    </label>
                    <input
                      {...registerForm('company')}
                      type="text"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="กรอกชื่อบริษัทหรือหน่วยงาน"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อผู้ใช้
                    </label>
                    <input
                      {...registerForm('username')}
                      type="text"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="กรอกชื่อผู้ใช้ที่ต้องการ"
                    />
                    {registerErrors.username && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.username.message as string}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      รหัสผ่าน
                    </label>
                    <input
                      {...registerForm('password')}
                      type="password"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="กรอกรหัสผ่านของคุณ"
                    />
                    {registerErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.password.message as string}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      ยืนยันรหัสผ่าน
                    </label>
                    <input
                      {...registerForm('confirmPassword')}
                      type="password"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                    />
                    {registerErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.confirmPassword.message as string}</p>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                    >
                      {isSubmitting || isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          กำลังสมัครสมาชิก...
                        </>
                      ) : (
                        '📝 สมัครสมาชิก'
                      )}
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      มีบัญชีอยู่แล้ว?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                      >
                        เข้าสู่ระบบ
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* Tab Content - Web Portal Login */}
            {activeTab === 'officer' && (
              <div className="max-w-md mx-auto p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center h-12 w-12 bg-green-100 rounded-full mb-4">
                    <span className="text-green-600 text-xl">👨‍💼</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">เข้าสู่ระบบ Web Portal</h3>
                  <p className="text-gray-600">สำหรับเจ้าหน้าที่ DEDE E-Service เท่านั้น</p>
                </div>
                
                {officerSuccess && (
                  <div className="rounded-md bg-green-50 border border-green-200 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <span className="text-green-400 text-lg">✅</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-800">{officerSuccess}</p>
                      </div>
                    </div>
                  </div>
                )}

                {officerError && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <span className="text-red-400 text-lg">⚠️</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-800">{officerError}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form className="space-y-6" onSubmit={handleOfficerSubmit(onOfficerSubmit)}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="officer-username" className="block text-sm font-medium text-gray-700 mb-1">
                        ชื่อผู้ใช้
                      </label>
                      <input
                        {...registerOfficer('username')}
                        type="text"
                        autoComplete="username"
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                        placeholder="กรอกชื่อผู้ใช้เจ้าหน้าที่"
                      />
                      {officerErrors.username && (
                        <p className="mt-1 text-sm text-red-600">{officerErrors.username.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="officer-password" className="block text-sm font-medium text-gray-700 mb-1">
                        รหัสผ่าน
                      </label>
                      <input
                        {...registerOfficer('password')}
                        type="password"
                        autoComplete="current-password"
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                        placeholder="กรอกรหัสผ่านเจ้าหน้าที่"
                      />
                      {officerErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{officerErrors.password.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me-officer"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me-officer" className="ml-2 block text-sm text-gray-700">
                        จดจำฉัน
                      </label>
                    </div>

                    <div className="text-sm">
                      <button
                        type="button"
                        onClick={() => setShowPasswordReset(true)}
                        className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200"
                      >
                        🔑 ลืมรหัสผ่าน?
                      </button>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
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
                        '👨‍💼 เข้าสู่ระบบ'
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">หรือ</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowLoginWithOTP(true)}
                      className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      📱 เข้าสู่ระบบด้วย OTP
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}