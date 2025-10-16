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
  }, [isAuthenticated, isLoading, router, user, activeTab])

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    setSuccess(null)
    
    const result = await login(data.username, data.password)
    
    if (!result.success) {
      setError(result.message || 'Login failed')
    } else {
      // Show success message and redirect
      setSuccess('เข้าสู่ระบบสำเร็จแล้ว')
      setTimeout(() => {
        router.push('/eservice/dede')
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
        router.push('/admin-portal')
      }, 1000)
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
                onClick={() => setActiveTab('officer')}
                className={`px-6 py-3 text-center font-medium text-sm ${
                  activeTab === 'officer'
                    ? 'text-white border-b-2 border-white'
                    : 'text-green-100 hover:text-white'
                }`}
              >
                เข้าสู่ระบบเจ้าหน้าที่
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
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-white mb-4">สมัครสมาชิกใหม่</h3>
                <p className="text-green-100 mb-6">
                  สำหรับผู้ใช้งานใหม่ที่ต้องการสมัครใช้งานระบบ
                </p>
                
                {/* Registration Type Selection */}
                <div className="space-y-4 mb-6">
                  <div className="rounded-lg border border-white border-opacity-20 p-4 hover:border-opacity-40 transition-colors bg-white bg-opacity-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-white">บุคคลธรรมดา</h4>
                        <p className="text-sm text-green-100">สำหรับผู้ขอใบอนุญาตรายบุคคล</p>
                      </div>
                      <button
                        onClick={() => {/* Continue with individual registration */}}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        เลือก
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white border-opacity-20 p-4 hover:border-opacity-40 transition-colors bg-white bg-opacity-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-white">นิติบุคคล</h4>
                        <p className="text-sm text-green-100">สำหรับบริษัท ห้างหุ้นส่วน หรือองค์กร</p>
                      </div>
                      <button
                        onClick={() => setShowCorporateRegistration(true)}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        เลือก
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-green-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-green-100">หรือกรอกแบบฟอร์มด้านล่าง</span>
                  </div>
                </div>
                
                {/* Individual Registration Form */}
                <form className="space-y-4" onSubmit={handleRegisterSubmit(onRegisterSubmit)}>
                  {registrationError && (
                    <div className="rounded-md bg-red-50 p-4">
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
                    <input
                      {...registerForm('fullName')}
                      type="text"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="ชื่อ-นามสกุล"
                    />
                    {registerErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.fullName.message as string}</p>
                    )}
                  </div>
                  
                  <div>
                    <input
                      {...registerForm('email')}
                      type="email"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="อีเมล"
                    />
                    {registerErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.email.message as string}</p>
                    )}
                  </div>
                  
                  <div>
                    <input
                      {...registerForm('phone')}
                      type="tel"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="เบอร์โทรศัพท์ (ไม่จำเป็น)"
                    />
                  </div>
                  
                  <div>
                    <input
                      {...registerForm('company')}
                      type="text"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="บริษัท/หน่วยงาน (ไม่จำเป็น)"
                    />
                  </div>
                  
                  <div>
                    <input
                      {...registerForm('username')}
                      type="text"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="ชื่อผู้ใช้"
                    />
                    {registerErrors.username && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.username.message as string}</p>
                    )}
                  </div>
                  
                  <div>
                    <input
                      {...registerForm('password')}
                      type="password"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="รหัสผ่าน"
                    />
                    {registerErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.password.message as string}</p>
                    )}
                  </div>
                  
                  <div>
                    <input
                      {...registerForm('confirmPassword')}
                      type="password"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="ยืนยันรหัสผ่าน"
                    />
                    {registerErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.confirmPassword.message as string}</p>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
                  
                  <div className="text-center">
                    <p className="text-sm text-green-100">
                      มีบัญชีอยู่แล้ว?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="font-medium text-white hover:text-green-100"
                      >
                        เข้าสู่ระบบ
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'officer' && (
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-white mb-4">เข้าสู่ระบบ Web Portal</h3>
                <p className="text-green-100 mb-6">
                  สำหรับเจ้าหน้าที่ DEDE E-Service
                </p>
                
                {officerSuccess && (
                  <div className="rounded-md bg-green-50 p-4 mb-6">
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
                  <div className="rounded-md bg-red-50 p-4 mb-6">
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
                
                <form className="space-y-6" onSubmit={handleOfficerSubmit(onOfficerSubmit)}>
                  <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                      <input
                        {...registerOfficer('username')}
                        type="text"
                        autoComplete="username"
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="ชื่อผู้ใช้"
                      />
                      {officerErrors.username && (
                        <p className="mt-1 text-sm text-red-600">{officerErrors.username.message}</p>
                      )}
                    </div>
                    <div>
                      <input
                        {...registerOfficer('password')}
                        type="password"
                        autoComplete="current-password"
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="รหัสผ่าน"
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
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me-officer" className="ml-2 block text-sm text-white">
                        จดจำฉัน
                      </label>
                    </div>

                    <div className="text-sm">
                      <button
                        type="button"
                        onClick={() => setShowPasswordReset(true)}
                        className="font-medium text-white hover:text-green-100"
                      >
                        ลืมรหัสผ่าน?
                      </button>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-green-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-transparent text-green-100">หรือ</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowLoginWithOTP(true)}
                      className="w-full flex justify-center py-2 px-4 border border-green-300 rounded-md shadow-sm text-sm font-medium text-white bg-white bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      เข้าสู่ระบบด้วย OTP
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