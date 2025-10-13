'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { ForgotPasswordData, ResetPasswordData } from '@/types'
import OTPVerification from './OTPVerification'

interface PasswordResetProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function PasswordReset({ onSuccess, onCancel }: PasswordResetProps) {
  const { forgotPassword, resetPassword, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [showResetForm, setShowResetForm] = useState(false)
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<any>({
    defaultValues: {
      email: '',
      token: '',
      password: '',
      confirmPassword: '',
    },
  })

  const watchedEmail = watch('email')
  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  const onSubmitForgotPassword = async (data: ForgotPasswordData) => {
    setError(null)
    setSuccess(null)
    
    const result = await forgotPassword(data)
    
    if (result.success) {
      setSuccess('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลเรียบร้อยแล้ว')
      setEmail(data.email)
      // In a real implementation, you might redirect to a page where users can enter the token
      // For now, we'll simulate the token verification flow
      setTimeout(() => {
        setShowResetForm(true)
        setSuccess(null)
      }, 2000)
    } else {
      setError(result.message || 'ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้')
    }
  }

  const onSubmitResetPassword = async (data: ResetPasswordData) => {
    setError(null)
    setSuccess(null)
    
    const resetData: ResetPasswordData = {
      token: resetToken || 'demo-token', // In real implementation, this would come from email
      password: data.password,
    }
    
    const result = await resetPassword(resetData)
    
    if (result.success) {
      setSuccess('รีเซ็ตรหัสผ่านสำเร็จแล้ว')
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } else {
      setError(result.message || 'ไม่สามารถรีเซ็ตรหัสผ่านได้')
    }
  }

  const handleOTPVerified = (data?: any) => {
    // In case OTP verification is used for password reset
    if (data?.token) {
      setResetToken(data.token)
      setShowResetForm(true)
    }
  }

  if (showResetForm) {
    return (
      <div className="max-w-md w-full mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">ตั้งรหัสผ่านใหม่</h2>
          <p className="text-secondary-600 mb-6">
            กรุณาตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ
          </p>
          <p className="text-sm text-secondary-500 mb-6">
            อีเมล: {email}
          </p>
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

        <form onSubmit={handleSubmit(onSubmitResetPassword)} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
              รหัสผ่านใหม่
            </label>
            <input
              {...register('password', { 
                required: 'กรุณาระบุรหัสผ่านใหม่',
                minLength: {
                  value: 6,
                  message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
                }
              })}
              type="password"
              className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="รหัสผ่านใหม่"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-danger-600">{errors.password.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-2">
              ยืนยันรหัสผ่านใหม่
            </label>
            <input
              {...register('confirmPassword', { 
                required: 'กรุณายืนยันรหัสผ่านใหม่',
                validate: value => value === password || 'รหัสผ่านไม่ตรงกัน'
              })}
              type="password"
              className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="ยืนยันรหัสผ่านใหม่"
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-danger-600">{errors.confirmPassword.message as string}</p>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading || !password || password !== confirmPassword}
              className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังตั้งรหัสผ่าน...
                </>
              ) : (
                'ตั้งรหัสผ่านใหม่'
              )}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">ลืมรหัสผ่าน</h2>
        <p className="text-secondary-600 mb-6">
          กรุณาระบุอีเมลที่ใช้ในการสมัครสมาชิกเพื่อรีเซ็ตรหัสผ่าน
        </p>
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

      <form onSubmit={handleSubmit(onSubmitForgotPassword)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
            อีเมล
          </label>
          <input
            {...register('email', { 
              required: 'กรุณาระบุอีเมล',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'รูปแบบอีเมลไม่ถูกต้อง'
              }
            })}
            type="email"
            className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-danger-600">{errors.email.message as string}</p>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isLoading || !watchedEmail}
            className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังส่ง...
              </>
            ) : (
              'ส่งลิงก์รีเซ็ตรหัสผ่าน'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}