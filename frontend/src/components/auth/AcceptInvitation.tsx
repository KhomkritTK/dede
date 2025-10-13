'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { AcceptInvitationData } from '@/types'
import OTPVerification from './OTPVerification'

interface AcceptInvitationProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function AcceptInvitation({ onSuccess, onCancel }: AcceptInvitationProps) {
  const { acceptInvitation, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [email, setEmail] = useState('')
  const [invitationToken, setInvitationToken] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<any>({
    defaultValues: {
      invitationToken: '',
      username: '',
      email: '',
      password: '',
      fullName: '',
      phone: '',
      otpCode: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    // Get invitation token from URL params
    const token = searchParams.get('token')
    const invitedEmail = searchParams.get('email')
    
    if (token) {
      setInvitationToken(token)
      setValue('invitationToken', token)
    }
    
    if (invitedEmail) {
      setEmail(invitedEmail)
      setValue('email', invitedEmail)
    }
  }, [searchParams, setValue])

  const onSubmit = async (data: AcceptInvitationData) => {
    setError(null)
    setSuccess(null)
    
    const result = await acceptInvitation(data)
    
    if (result.success) {
      setSuccess('ยอมรับคำเชิญและสมัครสมาชิกสำเร็จแล้ว')
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } else {
      setError(result.message || 'ไม่สามารถยอมรับคำเชิญได้')
    }
  }

  const handleOTPVerified = () => {
    // OTP verified, continue with registration
    setSuccess('การยืนยัน OTP สำเร็จ')
    setShowOTPVerification(false)
  }

  const handleCancelOTP = () => {
    setShowOTPVerification(false)
  }

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  if (showOTPVerification) {
    return (
      <div className="max-w-md w-full mx-auto">
        <OTPVerification
          identifier={email}
          purpose="corporate_invitation"
          onVerified={handleOTPVerified}
          onCancel={handleCancelOTP}
          title="ยืนยันการเชิญเข้าร่วมองค์กร"
          description="กรุณากรอกรหัส OTP ที่ได้รับทางอีเมลเพื่อยืนยันการเชิญเข้าร่วมองค์กร"
        />
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">ยอมรับคำเชิญเข้าร่วมองค์กร</h2>
        <p className="text-secondary-600 mb-6">
          กรุณากรอกข้อมูลเพื่อยอมรับคำเชิญและสร้างบัญชีผู้ใช้
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="invitationToken" className="block text-sm font-medium text-secondary-700">
            รหัสคำเชิญ
          </label>
          <input
            {...register('invitationToken')}
            type="text"
            readOnly
            className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm bg-secondary-100 sm:text-sm"
            placeholder="รหัสคำเชิญ"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
            อีเมลที่ได้รับคำเชิญ
          </label>
          <input
            {...register('email')}
            type="email"
            readOnly
            className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm bg-secondary-100 sm:text-sm"
            placeholder="อีเมล"
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-secondary-700">
            ชื่อผู้ใช้ *
          </label>
          <input
            {...register('username', { required: 'กรุณาระบุชื่อผู้ใช้' })}
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="ชื่อผู้ใช้"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-danger-600">{errors.username.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-secondary-700">
            ชื่อ-นามสกุล *
          </label>
          <input
            {...register('fullName', { required: 'กรุณาระบุชื่อ-นามสกุล' })}
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="ชื่อ-นามสกุล"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-danger-600">{errors.fullName.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-secondary-700">
            เบอร์โทรศัพท์
          </label>
          <input
            {...register('phone')}
            type="tel"
            className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="เบอร์โทรศัพท์"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
            รหัสผ่าน *
          </label>
          <input
            {...register('password', { 
              required: 'กรุณาระบุรหัสผ่าน',
              minLength: {
                value: 6,
                message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
              }
            })}
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="รหัสผ่าน"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-danger-600">{errors.password.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
            ยืนยันรหัสผ่าน *
          </label>
          <input
            {...register('confirmPassword', { 
              required: 'กรุณายืนยันรหัสผ่าน',
              validate: value => value === password || 'รหัสผ่านไม่ตรงกัน'
            })}
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="ยืนยันรหัสผ่าน"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-danger-600">{errors.confirmPassword.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="otpCode" className="block text-sm font-medium text-secondary-700">
            รหัส OTP (6 หลัก) *
          </label>
          <input
            {...register('otpCode', { 
              required: 'กรุณาระบุรหัส OTP',
              pattern: {
                value: /^\d{6}$/,
                message: 'รหัส OTP ต้องเป็นตัวเลข 6 หลัก'
              }
            })}
            type="text"
            inputMode="numeric"
            maxLength={6}
            className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="000000"
          />
          {errors.otpCode && (
            <p className="mt-1 text-sm text-danger-600">{errors.otpCode.message as string}</p>
          )}
          <p className="mt-1 text-sm text-secondary-500">
            รหัส OTP ถูกส่งไปยังอีเมลที่รับคำเชิญ
          </p>
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
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังดำเนินการ...
              </>
            ) : (
              'ยอมรับคำเชิญ'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}