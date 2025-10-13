'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { User } from '@/types'
import {
  UserIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  PhoneIcon,
  KeyIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  department?: string
  position?: string
  phone?: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      department: user?.department || '',
      position: user?.position || '',
      phone: user?.phone || '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm<PasswordFormData>()

  const newPassword = watch('newPassword')

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      const response = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'อัพเดตโปรไฟล์สำเร็จ' })
        setIsEditing(false)
        refreshProfile()
      } else {
        setMessage({ type: 'error', text: result.message || 'อัพเดตโปรไฟล์ไม่สำเร็จ' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัพเดตโปรไฟล์' })
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      const response = await fetch('/api/v1/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จ' })
        setIsChangingPassword(false)
        resetPassword()
      } else {
        setMessage({ type: 'error', text: result.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' })
    }
  }

  const cancelEdit = () => {
    resetProfile({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      department: user?.department || '',
      position: user?.position || '',
      phone: user?.phone || '',
    })
    setIsEditing(false)
  }

  const cancelPasswordChange = () => {
    resetPassword()
    setIsChangingPassword(false)
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:px-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">กำลังโหลดข้อมูลผู้ใช้...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">โปรไฟล์ผู้ใช้</h1>
            <p className="mt-1 text-sm text-gray-600">
              จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชีของคุณ
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`rounded-md p-4 mb-6 ${
              message.type === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {message.type === 'success' ? (
                    <CheckIcon className="h-5 w-5 text-green-400" />
                  ) : (
                    <XMarkIcon className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {message.text}
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      onClick={() => setMessage(null)}
                      className={`inline-flex rounded-md p-1.5 ${
                        message.type === 'success' 
                          ? 'bg-green-50 text-green-500 hover:bg-green-100' 
                          : 'bg-red-50 text-red-500 hover:bg-red-100'
                      }`}
                    >
                      <span className="sr-only">Dismiss</span>
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                        <UserIcon className="h-12 w-12 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">ชื่อผู้ใช้</dt>
                        <dd className="text-sm text-gray-900">{user.username}</dd>
                      </div>
                      {user.department && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">แผนก</dt>
                          <dd className="text-sm text-gray-900">{user.department}</dd>
                        </div>
                      )}
                      {user.position && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">ตำแหน่ง</dt>
                          <dd className="text-sm text-gray-900">{user.position}</dd>
                        </div>
                      )}
                      {user.phone && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</dt>
                          <dd className="text-sm text-gray-900">{user.phone}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-sm font-medium text-gray-500">วันที่สร้างบัญชี</dt>
                        <dd className="text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString('th-TH')}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Profile Form */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">ข้อมูลส่วนตัว</h3>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        แก้ไข
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          ชื่อ
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          {...registerProfile('firstName', { required: 'กรุณาระบุชื่อ' })}
                          disabled={!isEditing}
                          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                            !isEditing ? 'bg-gray-100' : ''
                          }`}
                        />
                        {profileErrors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.firstName.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          นามสกุล
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          {...registerProfile('lastName', { required: 'กรุณาระบุนามสกุล' })}
                          disabled={!isEditing}
                          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                            !isEditing ? 'bg-gray-100' : ''
                          }`}
                        />
                        {profileErrors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.lastName.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          อีเมล
                        </label>
                        <input
                          type="email"
                          id="email"
                          {...registerProfile('email', { 
                            required: 'กรุณาระบุอีเมล',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'รูปแบบอีเมลไม่ถูกต้อง'
                            }
                          })}
                          disabled={!isEditing}
                          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                            !isEditing ? 'bg-gray-100' : ''
                          }`}
                        />
                        {profileErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          เบอร์โทรศัพท์
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          {...registerProfile('phone')}
                          disabled={!isEditing}
                          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                            !isEditing ? 'bg-gray-100' : ''
                          }`}
                        />
                      </div>

                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                          แผนก
                        </label>
                        <input
                          type="text"
                          id="department"
                          {...registerProfile('department')}
                          disabled={!isEditing}
                          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                            !isEditing ? 'bg-gray-100' : ''
                          }`}
                        />
                      </div>

                      <div>
                        <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                          ตำแหน่ง
                        </label>
                        <input
                          type="text"
                          id="position"
                          {...registerProfile('position')}
                          disabled={!isEditing}
                          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                            !isEditing ? 'bg-gray-100' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          บันทึก
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Change Password Form */}
              <div className="mt-6 bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">เปลี่ยนรหัสผ่าน</h3>
                    {!isChangingPassword && (
                      <button
                        type="button"
                        onClick={() => setIsChangingPassword(true)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <KeyIcon className="h-4 w-4 mr-1" />
                        เปลี่ยนรหัสผ่าน
                      </button>
                    )}
                  </div>

                  {isChangingPassword && (
                    <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                            รหัสผ่านปัจจุบัน
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            {...registerPassword('currentPassword', { 
                              required: 'กรุณาระบุรหัสผ่านปัจจุบัน'
                            })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                          {passwordErrors.currentPassword && (
                            <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                            รหัสผ่านใหม่
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            {...registerPassword('newPassword', { 
                              required: 'กรุณาระบุรหัสผ่านใหม่',
                              minLength: {
                                value: 8,
                                message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'
                              }
                            })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                          {passwordErrors.newPassword && (
                            <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            ยืนยันรหัสผ่านใหม่
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            {...registerPassword('confirmPassword', { 
                              required: 'กรุณายืนยันรหัสผ่านใหม่',
                              validate: value => value === newPassword || 'รหัสผ่านไม่ตรงกัน'
                            })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                          {passwordErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={cancelPasswordChange}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          เปลี่ยนรหัสผ่าน
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}