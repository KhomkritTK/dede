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
import { authService } from '@/lib/auth'
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
    // Only proceed if not loading and user is authenticated
    if (!isLoading && !isPortalLoading && (isAuthenticated || isPortalAuth)) {
      const currentUser = user || portalUser
      if (!currentUser) return
      
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
      if (activeTab === 'login' && officerRoles.includes(currentUser.role)) {
        // Instead of logging out, redirect admin users to the appropriate dashboard
        setTimeout(() => {
          router.push('/admin-portal/dashboard')
        }, 1000)
        return
      }
      
      // If user is a regular user but logged in through officer login tab
      if (activeTab === 'officer' && !officerRoles.includes(currentUser.role)) {
        setTimeout(async () => {
          await logout()
          await portalLogout()
          setOfficerError('บัญชีนี้ไม่มีสิทธิเข้าใช้งานในฐานะเจ้าหน้าที่ กรุณาใช้แท็บเข้าสู่ระบบทั่วไป')
        }, 500)
        return
      }
      
      // For regular users on the login tab, don't auto-redirect
      // Let them choose which system to access or stay on the landing page
    }
  }, [isAuthenticated, isPortalAuth, isLoading, isPortalLoading, router, user, portalUser, activeTab, searchParams, logout, portalLogout])

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    setSuccess(null)
    
    // For regular user login, use the regular auth function
    const result = await login(data.username, data.password)
    
    if (!result.success) {
      setError(result.message || 'Login failed')
    } else {
      // Show success message and redirect based on user role
      setSuccess('เข้าสู่ระบบสำเร็จแล้ว')
      
      // Get user data from the result to avoid waiting for context update
      const userData = authService.getCurrentUser()
      
      setTimeout(() => {
        if (userData) {
          const adminRoles = [
            'admin', 'system_admin', 'dede_head_admin', 'dede_staff_admin', 'dede_consult_admin', 'auditor_admin'
          ]
          const officerRoles = [
            'dede_head', 'dede_staff', 'dede_consult', 'auditor'
          ]
          
          if (adminRoles.includes(userData.role)) {
            // Admin users go to admin portal
            router.push('/admin-portal/dashboard')
          } else if (officerRoles.includes(userData.role)) {
            // Officer users go to officer dashboard
            router.push('/eservice/dede/officer/dashboard')
          } else {
            // Regular users go to eservice home
            window.location.href = '/eservice/dede/home?login_success=true'
          }
        } else {
          // Fallback to eservice home
          window.location.href = '/eservice/dede/home?login_success=true'
        }
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
      
      setTimeout(() => {
        // Check for redirect parameter first
        const redirectParam = searchParams.get('redirect')
        if (redirectParam === 'web-view') {
          router.push('/eservice/dede/home')
          return
        } else if (redirectParam === 'web-view/admin-portal') {
          router.push('/admin-portal')
          return
        }
        
        // Otherwise, redirect based on user role
        if (portalUser) {
          const adminRoles = [
            'admin', 'system_admin', 'dede_head_admin', 'dede_staff_admin', 'dede_consult_admin', 'auditor_admin'
          ]
          const officerRoles = [
            'dede_head', 'dede_staff', 'dede_consult', 'auditor'
          ]
          
          if (adminRoles.includes(portalUser.role)) {
            // Admin users go to admin portal
            router.push('/admin-portal/dashboard')
          } else if (officerRoles.includes(portalUser.role)) {
            // Officer users go to officer dashboard
            router.push('/eservice/dede/officer/dashboard')
          } else {
            // Regular users go to eservice home
            router.push('/eservice/dede/home?login_success=true')
          }
        } else {
          // Fallback to admin portal for officer login
          router.push('/admin-portal')
        }
      }, 1000)
    }
  }

  const handleLoginWithOTPSuccess = () => {
    setShowLoginWithOTP(false)
    // Show success message and redirect based on user role
    setSuccess('เข้าสู่ระบบด้วย OTP สำเร็จแล้ว')
    
    setTimeout(() => {
      if (portalUser) {
        const adminRoles = [
          'admin', 'system_admin', 'dede_head_admin', 'dede_staff_admin', 'dede_consult_admin', 'auditor_admin'
        ]
        const officerRoles = [
          'dede_head', 'dede_staff', 'dede_consult', 'auditor'
        ]
        
        if (adminRoles.includes(portalUser.role)) {
          // Admin users go to admin portal
          router.push('/admin-portal/dashboard')
        } else if (officerRoles.includes(portalUser.role)) {
          // Officer users go to officer dashboard
          router.push('/eservice/dede/officer/dashboard')
        } else {
          // Regular users go to eservice home
          router.push('/eservice/dede/home?login_success=true')
        }
      } else {
        // Fallback to eservice home
        router.push('/eservice/dede/home?login_success=true')
      }
    }, 1000)
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
    // Show success message and redirect based on user role
    setOfficerSuccess('เข้าสู่ระบบด้วย OTP สำเร็จแล้ว')
    
    setTimeout(() => {
      // Check for redirect parameter first
      const redirectParam = searchParams.get('redirect')
      if (redirectParam === 'web-view') {
        router.push('/eservice/dede/home')
        return
      } else if (redirectParam === 'web-view/admin-portal') {
        router.push('/admin-portal')
        return
      }
      
      // Otherwise, redirect based on user role
      if (portalUser) {
        const adminRoles = [
          'admin', 'system_admin', 'dede_head_admin', 'dede_staff_admin', 'dede_consult_admin', 'auditor_admin'
        ]
        const officerRoles = [
          'dede_head', 'dede_staff', 'dede_consult', 'auditor'
        ]
        
        if (adminRoles.includes(portalUser.role)) {
          // Admin users go to admin portal
          router.push('/admin-portal/dashboard')
        } else if (officerRoles.includes(portalUser.role)) {
          // Officer users go to officer dashboard
          router.push('/eservice/dede/officer/dashboard')
        } else {
          // Regular users go to eservice home
          router.push('/eservice/dede/home?login_success=true')
        }
      } else {
        // Fallback to admin portal for officer login
        router.push('/admin-portal')
      }
    }, 1000)
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
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xl">DE</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">DEDE E-Service</h1>
                  <p className="text-sm text-gray-500">ระบบบริการอิเล็กทรอนิกส์</p>
                </div>
              </div>
            </div>
            
            {/* Login Form Container */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {/* Tab Headers */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    activeTab === 'login'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    activeTab === 'register'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  สมัครสมาชิก
                </button>
                <button
                  onClick={() => setActiveTab('officer')}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    activeTab === 'officer'
                      ? 'text-green-600 border-b-2 border-green-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  เข้าสู่ระบบเจ้าหน้าที่ พพ.
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'login' && (
                  <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                      <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-4">
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
                      <div className="rounded-md bg-green-50 border border-green-200 p-4 mb-4">
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
                    
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        ชื่อผู้ใช้
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input
                          {...register('username', { required: 'กรุณาระบุชื่อผู้ใช้' })}
                          type="text"
                          autoComplete="username"
                          className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                          placeholder="กรอกชื่อผู้ใช้"
                        />
                      </div>
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        รหัสผ่าน
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input
                          {...register('password', { required: 'กรุณาระบุรหัสผ่าน' })}
                          type="password"
                          autoComplete="current-password"
                          className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                          placeholder="กรอกรหัสผ่าน"
                        />
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                          จดจำฉัน
                        </label>
                      </div>

                      <div className="text-sm">
                        <button
                          type="button"
                          onClick={() => setShowPasswordReset(true)}
                          className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                        >
                          ลืมรหัสผ่าน?
                        </button>
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
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
                    
                    <div className="relative mt-6">
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
                        className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        เข้าสู่ระบบด้วย OTP
                      </button>
                    </div>
                  </form>
                )}
                
                {activeTab === 'register' && (
                  <form className="space-y-4" onSubmit={handleRegisterSubmit(onRegisterSubmit)}>
                    {registrationError && (
                      <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-800">{registrationError}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        ชื่อ-นามสกุล
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input
                          {...registerForm('fullName')}
                          type="text"
                          className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                          placeholder="กรอกชื่อและนามสกุลของคุณ"
                        />
                      </div>
                      {registerErrors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{registerErrors.fullName.message as string}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        อีเมล
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                        <input
                          {...registerForm('email')}
                          type="email"
                          className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                          placeholder="กรอกอีเมลของคุณ"
                        />
                      </div>
                      {registerErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{registerErrors.email.message as string}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        ชื่อผู้ใช้
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input
                          {...registerForm('username')}
                          type="text"
                          className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                          placeholder="กรอกชื่อผู้ใช้ที่ต้องการ"
                        />
                      </div>
                      {registerErrors.username && (
                        <p className="mt-1 text-sm text-red-600">{registerErrors.username.message as string}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        รหัสผ่าน
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input
                          {...registerForm('password')}
                          type="password"
                          className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                          placeholder="กรอกรหัสผ่านของคุณ"
                        />
                      </div>
                      {registerErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{registerErrors.password.message as string}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        ยืนยันรหัสผ่าน
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input
                          {...registerForm('confirmPassword')}
                          type="password"
                          className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                          placeholder="กรอกรหัสผ่านอีกครั้ง"
                        />
                      </div>
                      {registerErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{registerErrors.confirmPassword.message as string}</p>
                      )}
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
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
                          'สมัครสมาชิก'
                        )}
                      </button>
                    </div>
                    
                    <div className="text-center mt-4">
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
                )}
              </div>
            </div>

            {/* Officer Login Tab Content */}
            {activeTab === 'officer' && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden mt-6">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
                  <div className="text-center">
                    <div className="h-16 w-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm mx-auto mb-4">
                      <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">เข้าสู่ระบบเจ้าหน้าที่ พพ.</h3>
                    <p className="text-green-100">สำหรับเจ้าหน้าที่ DEDE E-Service</p>
                    <p className="text-green-200 text-sm mt-1">พัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน</p>
                  </div>
                </div>
                <div className="p-6">
                  {officerSuccess && (
                    <div className="rounded-md bg-green-50 border border-green-200 p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-800">{officerSuccess}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {officerError && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{officerError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <form className="space-y-4" onSubmit={handleOfficerSubmit(onOfficerSubmit)}>
                    <div>
                      <label htmlFor="officer-username" className="block text-sm font-medium text-gray-700 mb-2">
                        ชื่อผู้ใช้
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input
                          {...registerOfficer('username')}
                          type="text"
                          autoComplete="username"
                          className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                          placeholder="กรอกชื่อผู้ใช้เจ้าหน้าที่"
                        />
                      </div>
                      {officerErrors.username && (
                        <p className="mt-1 text-sm text-red-600">{officerErrors.username.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="officer-password" className="block text-sm font-medium text-gray-700 mb-2">
                        รหัสผ่าน
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input
                          {...registerOfficer('password')}
                          type="password"
                          autoComplete="current-password"
                          className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                          placeholder="กรอกรหัสผ่านเจ้าหน้าที่"
                        />
                      </div>
                      {officerErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{officerErrors.password.message}</p>
                      )}
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
                          ลืมรหัสผ่าน?
                        </button>
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]"
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
                    
                    <div className="relative mt-6">
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
                        className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        เข้าสู่ระบบด้วย OTP
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Side - Hero Section */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col justify-center items-center p-8 lg:p-12">
          <div className="max-w-lg text-center">
            <h1 className="text-4xl font-bold mb-6">
              ระบบบริการอิเล็กทรอนิกส์
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน
            </p>
            
            {/* Service Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
                <div className="h-12 w-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">ขอรับใบอนุญาตใหม่</h3>
                <p className="text-sm text-blue-100">สำหรับผู้ประกอบการที่ต้องการขอรับใบอนุญาตพลังงานทดแทนครั้งแรก</p>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
                <div className="h-12 w-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">ขอต่ออายุใบอนุญาต</h3>
                <p className="text-sm text-blue-100">ต่ออายุใบอนุญาตที่กำลังจะหมดอายุ</p>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
                <div className="h-12 w-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">ขอขยายการผลิต</h3>
                <p className="text-sm text-blue-100">ขอเพิ่มกำลังการผลิตพลังงานทดแทน</p>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
                <div className="h-12 w-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">ขอลดการผลิต</h3>
                <p className="text-sm text-blue-100">ขอลดกำลังการผลิตพลังงานทดแทน</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200">
                เรียนรู้เพิ่มเติม
              </button>
              <button className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-400 transition-colors duration-200">
                ดาวน์โหลดแบบฟอร์ม
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">ทำไมต้องเลือกเรา</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ระบบบริการอิเล็กทรอนิกส์ของเรามีคุณสมบัติที่จำเป็นสำหรับการจัดการคำขอใบอนุญาตพลังงานทดแทนและอนุรักษ์พลังงาน
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">รวดเร็วและสะดวก</h3>
              <p className="text-gray-600">ยื่นคำขอและติดตามสถานะได้ทุกที่ทุกเวลา ลดเวลาในการดำเนินการ</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ปลอดภัยและเชื่อถือได้</h3>
              <p className="text-gray-600">ระบบรักษาความปลอดภัยขั้นสูง รักษาข้อมูลของคุณเป็นความลับ</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ติดตามได้ง่าย</h3>
              <p className="text-gray-600">ตรวจสอบสถานะคำขอและรับแจ้งเมื่อมีการอัปเดต</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">สถิติของเรา</h2>
            <p className="text-blue-100">ตัวเลขที่แสดงถึงความเชื่อมั่นของผู้ใช้งานในระบบของเรา</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">1,200+</div>
              <p className="text-blue-100">คำขอที่ดำเนินการ</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">800+</div>
              <p className="text-blue-100">ใบอนุญาตที่อนุมัติ</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">500+</div>
              <p className="text-blue-100">ผู้ใช้งานที่ลงทะเบียน</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50+</div>
              <p className="text-blue-100">เจ้าหน้าที่ที่ทำงาน</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">ติดต่อเรา</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              มีคำถามหรือต้องการความช่วยเหลือเพิ่มเติม ติดต่อทีมงานของเราได้
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">โทรศัพท์</h3>
              <p className="text-gray-600">02-123-4567</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">อีเมล</h3>
              <p className="text-gray-600">info@dede.go.th</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ที่อยู่</h3>
              <p className="text-gray-600">กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold">DE</span>
                </div>
                <span className="text-xl font-bold">DEDE E-Service</span>
              </div>
              <p className="text-gray-400 text-sm">
                ระบบบริการอิเล็กทรอนิกส์สำหรับการจัดการคำขอใบอนุญาตพลังงานทดแทนและอนุรักษ์พลังงาน
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">บริการของเรา</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">ขอรับใบอนุญาตใหม่</a></li>
                <li><a href="#" className="hover:text-white">ขอต่ออายุใบอนุญาต</a></li>
                <li><a href="#" className="hover:text-white">ขอขยายการผลิต</a></li>
                <li><a href="#" className="hover:text-white">ขอลดการผลิต</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">ข้อมูลเพิ่มเติม</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">คู่มือการใช้งาน</a></li>
                <li><a href="#" className="hover:text-white">ข้อบังคับและเงื่อนไข</a></li>
                <li><a href="#" className="hover:text-white">นโยบายความเป็นส่วนตัว</a></li>
                <li><a href="#" className="hover:text-white">คำถามที่พบบ่อย</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">ติดต่อเรา</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>โทร: 02-123-4567</li>
                <li>อีเมล: info@dede.go.th</li>
                <li>ที่อยู่: กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
            <p>&copy; 2024 กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน. สงวนลิขสิทธิ์</p>
          </div>
        </div>
      </footer>
    </div>
  )
}