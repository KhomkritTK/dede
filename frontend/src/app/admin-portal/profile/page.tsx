'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { usePortalAuth } from '@/hooks/usePortalAuth'
import { ChangePasswordData } from '@/types'
import { apiClient } from '@/lib/api'
import {
  UserIcon,
  ShieldCheckIcon,
  KeyIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

export default function AdminProfilePage() {
  const { user, isAuthenticated, isLoading, refreshProfile, updateProfile } = usePortalAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setValue: setProfileValue,
  } = useForm<any>({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      company: '',
      address: '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch,
    reset: resetPassword,
  } = useForm<any>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const newPassword = watch('newPassword')
  const confirmPassword = watch('confirmPassword')

  useEffect(() => {
    if (user) {
      setProfileValue('fullName', user.fullName || '')
      setProfileValue('email', user.email || '')
      setProfileValue('phone', user.phone || '')
      setProfileValue('company', user.company || '')
      setProfileValue('address', user.address || '')
    }
  }, [user, setProfileValue])

  const onProfileSubmit = async (data: any) => {
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const result = await updateProfile({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        address: data.address,
      })
      
      if (result.success) {
        setSuccess('อัปเดตข้อมูลส่วนตัวสำเร็จแล้ว')
        await refreshProfile()
      } else {
        setError(result.message || 'ไม่สามารถอัปเดตข้อมูลส่วนตัวได้')
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onPasswordSubmit = async (data: ChangePasswordData) => {
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const response = await apiClient.put('/api/v1/auth/password', {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      })
      
      if (response.success) {
        setSuccess('เปลี่ยนรหัสผ่านสำเร็จแล้ว')
        resetPassword()
      } else {
        setError(response.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'system_admin':
        return 'ผู้ดูแลระบบ'
      case 'dede_head_admin':
        return 'ผู้บริหาร DEDE'
      case 'dede_staff_admin':
        return 'เจ้าหน้าที่ DEDE'
      case 'dede_consult_admin':
        return 'ที่ปรึกษา DEDE'
      case 'auditor_admin':
        return 'ผู้ตรวจสอบ'
      case 'admin':
        return 'ผู้ดูแลระบบ'
      default:
        return role
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่ได้เข้าสู่ระบบ</h1>
          <p className="text-gray-600">กรุณาเข้าสู่ระบบเพื่อดูข้อมูลส่วนตัว</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">โปรไฟล์ผู้ดูแลระบบ</h1>
          <p className="text-gray-600">จัดการข้อมูลส่วนตัวและการตั้งค่าความปลอดภัย</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  ข้อมูลส่วนตัว
                </div>
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'password'
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <KeyIcon className="h-5 w-5 mr-2" />
                  เปลี่ยนรหัสผ่าน
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      ชื่อผู้ใช้
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        <UserIcon className="h-5 w-5" />
                      </span>
                      <input
                        type="text"
                        value={user.username}
                        disabled
                        className="flex-1 rounded-none rounded-r-md border-gray-300 bg-gray-100 text-gray-500 sm:text-sm"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">ไม่สามารถเปลี่ยนชื่อผู้ใช้ได้</p>
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      บทบาท
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        <ShieldCheckIcon className="h-5 w-5" />
                      </span>
                      <input
                        type="text"
                        value={getRoleDisplayName(user.role)}
                        disabled
                        className="flex-1 rounded-none rounded-r-md border-gray-300 bg-gray-100 text-gray-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      ชื่อ-นามสกุล
                    </label>
                    <input
                      {...registerProfile('fullName', { required: 'กรุณาระบุชื่อ-นามสกุล' })}
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                    {profileErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.fullName.message as string}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      อีเมล
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        <EnvelopeIcon className="h-5 w-5" />
                      </span>
                      <input
                        {...registerProfile('email', { 
                          required: 'กรุณาระบุอีเมล',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'รูปแบบอีเมลไม่ถูกต้อง'
                          }
                        })}
                        type="email"
                        className="flex-1 rounded-none rounded-r-md border-gray-300 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                    {profileErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.email.message as string}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      เบอร์โทรศัพท์
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        <PhoneIcon className="h-5 w-5" />
                      </span>
                      <input
                        {...registerProfile('phone')}
                        type="tel"
                        className="flex-1 rounded-none rounded-r-md border-gray-300 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                      หน่วยงาน/แผนก
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        <BuildingOfficeIcon className="h-5 w-5" />
                      </span>
                      <input
                        {...registerProfile('company')}
                        type="text"
                        className="flex-1 rounded-none rounded-r-md border-gray-300 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    ที่อยู่
                  </label>
                  <div className="mt-1">
                    <textarea
                      {...registerProfile('address')}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    รหัสผ่านปัจจุบัน
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      <KeyIcon className="h-5 w-5" />
                    </span>
                    <input
                      {...registerPassword('currentPassword', { 
                        required: 'กรุณาระบุรหัสผ่านปัจจุบัน'
                      })}
                      type="password"
                      className="flex-1 rounded-none rounded-r-md border-gray-300 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message as string}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    รหัสผ่านใหม่
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      <KeyIcon className="h-5 w-5" />
                    </span>
                    <input
                      {...registerPassword('newPassword', { 
                        required: 'กรุณาระบุรหัสผ่านใหม่',
                        minLength: {
                          value: 6,
                          message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
                        }
                      })}
                      type="password"
                      className="flex-1 rounded-none rounded-r-md border-gray-300 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message as string}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    ยืนยันรหัสผ่านใหม่
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      <KeyIcon className="h-5 w-5" />
                    </span>
                    <input
                      {...registerPassword('confirmPassword', { 
                        required: 'กรุณายืนยันรหัสผ่านใหม่',
                        validate: value => value === newPassword || 'รหัสผ่านไม่ตรงกัน'
                      })}
                      type="password"
                      className="flex-1 rounded-none rounded-r-md border-gray-300 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message as string}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}