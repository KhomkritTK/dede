'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { ChangePasswordData } from '@/types'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, changePassword, updateProfile, refreshProfile } = useAuth() as any
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
      const result = await updateProfile(data)
      
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
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      
      if (result.success) {
        setSuccess('เปลี่ยนรหัสผ่านสำเร็จแล้ว')
        resetPassword()
      } else {
        setError(result.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้')
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">ไม่ได้เข้าสู่ระบบ</h1>
          <p className="text-secondary-600">กรุณาเข้าสู่ระบบเพื่อดูข้อมูลส่วนตัว</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">ข้อมูลส่วนตัว</h1>
        <p className="text-secondary-600">จัดการข้อมูลส่วนตัวและการตั้งค่าความปลอดภัย</p>
      </div>

      {error && (
        <div className="rounded-md bg-danger-50 p-4 mb-6">
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

      {success && (
        <div className="rounded-md bg-success-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-success-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-success-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-secondary-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              ข้อมูลส่วนตัว
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'password'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-secondary-700">
                    ชื่อผู้ใช้
                  </label>
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm bg-secondary-100 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-secondary-500">ไม่สามารถเปลี่ยนชื่อผู้ใช้ได้</p>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-secondary-700">
                    บทบาท
                  </label>
                  <input
                    type="text"
                    value={user.role}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm bg-secondary-100 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-secondary-700">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    {...registerProfile('fullName', { required: 'กรุณาระบุชื่อ-นามสกุล' })}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                  {profileErrors.fullName && (
                    <p className="mt-1 text-sm text-danger-600">{profileErrors.fullName.message as string}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                    อีเมล
                  </label>
                  <input
                    {...registerProfile('email', { 
                      required: 'กรุณาระบุอีเมล',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'รูปแบบอีเมลไม่ถูกต้อง'
                      }
                    })}
                    type="email"
                    className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                  {profileErrors.email && (
                    <p className="mt-1 text-sm text-danger-600">{profileErrors.email.message as string}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-secondary-700">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    {...registerProfile('phone')}
                    type="tel"
                    className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-secondary-700">
                    บริษัท/หน่วยงาน
                  </label>
                  <input
                    {...registerProfile('company')}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-secondary-700">
                  ที่อยู่
                </label>
                <textarea
                  {...registerProfile('address')}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-secondary-700">
                  รหัสผ่านปัจจุบัน
                </label>
                <input
                  {...registerPassword('currentPassword', { 
                    required: 'กรุณาระบุรหัสผ่านปัจจุบัน'
                  })}
                  type="password"
                  className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-danger-600">{passwordErrors.currentPassword.message as string}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-secondary-700">
                  รหัสผ่านใหม่
                </label>
                <input
                  {...registerPassword('newPassword', { 
                    required: 'กรุณาระบุรหัสผ่านใหม่',
                    minLength: {
                      value: 6,
                      message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
                    }
                  })}
                  type="password"
                  className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-danger-600">{passwordErrors.newPassword.message as string}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  {...registerPassword('confirmPassword', { 
                    required: 'กรุณายืนยันรหัสผ่านใหม่',
                    validate: value => value === newPassword || 'รหัสผ่านไม่ตรงกัน'
                  })}
                  type="password"
                  className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-danger-600">{passwordErrors.confirmPassword.message as string}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}