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
    
    // For Web View login, always use portal auth
    const result = await portalLogin(data.username, data.password)
    
    if (!result.success) {
      setError(result.message || 'Login failed')
    } else {
      // Show success message and redirect based on user role
      setSuccess('เข้าสู่ระบบสำเร็จแล้ว')
      setTimeout(() => {
        // Use the portalUser from context after successful login
        // The context should be updated by the time this timeout executes
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
            router.push('/eservice/dede/home')
          }
        } else {
          // Fallback to eservice home
          router.push('/eservice/dede/home')
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
            router.push('/eservice/dede/home')
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
          router.push('/eservice/dede/home')
        }
      } else {
        // Fallback to eservice home
        router.push('/eservice/dede/home')
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
          router.push('/eservice/dede/home')
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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">DE</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-gray-900">DEDE E-Service</h1>
                <p className="text-sm text-gray-500">ระบบบริการอิเล็กทรอนิกส์</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ระบบบริการอิเล็กทรอนิกส์
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน
            </p>
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
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">บริการของเรา</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              เลือกบริการที่เหมาะสมกับการใช้งานของคุณ
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Web View Card */}
            <div className={`bg-white border rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
              activeTab === 'login' || activeTab === 'register'
                ? 'ring-2 ring-blue-500 transform scale-105'
                : 'hover:shadow-lg'
            }`}>
              <div className="bg-blue-600 p-6">
                <div className="text-center">
                  <div className="h-12 w-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm mx-auto mb-3">
                    <span className="text-white font-bold text-xl">WV</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">Web View</h3>
                  <p className="text-blue-100 text-sm">สำหรับผู้ขอใบอนุญาตและผู้ใช้งานทั่วไป</p>
                </div>
              </div>
              
              <div className="p-6 bg-white">
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">ขอรับใบอนุญาตใหม่</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">ขอต่ออายุใบอนุญาต</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">ขอขยายการผลิต</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">ขอลดการผลิต</span>
                  </li>
                </ul>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === 'login'
                        ? 'bg-blue-600 text-white shadow hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🚪 เข้าสู่ระบบ
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === 'register'
                        ? 'bg-blue-600 text-white shadow hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📝 สมัครสมาชิกใหม่
                  </button>
                </div>
              </div>
            </div>

            {/* Web Portal Card */}
            <div className={`bg-white border rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
              activeTab === 'officer'
                ? 'ring-2 ring-green-500 transform scale-105'
                : 'hover:shadow-lg'
            }`}>
              <div className="bg-green-600 p-6">
                <div className="text-center">
                  <div className="h-12 w-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm mx-auto mb-3">
                    <span className="text-white font-bold text-xl">WP</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">Web Portal</h3>
                  <p className="text-green-100 text-sm">สำหรับเจ้าหน้าที่ DEDE E-Service</p>
                </div>
              </div>
              
              <div className="p-6 bg-white">
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">ตรวจสอบคำขอใบอนุญาต</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">อนุมัติคำขอใบอนุญาต</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">จัดการตารางการตรวจสอบ</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">ออกรายงานการตรวจสอบ</span>
                  </li>
                </ul>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('officer')}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === 'officer'
                        ? 'bg-green-600 text-white shadow hover:bg-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    👨‍💼 เข้าสู่ระบบเจ้าหน้าที่
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Login Forms Container */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden max-w-md mx-auto">

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
      </section>

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