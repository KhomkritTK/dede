'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { SendOTPData, LoginWithOTPCredentials } from '@/types'
import OTPVerification from './OTPVerification'

interface LoginWithOTPProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function LoginWithOTP({ onSuccess, onCancel }: LoginWithOTPProps) {
  const { sendOTP, loginWithOTP, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [otpType, setOtpType] = useState<'email' | 'phone'>('email')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<{
    identifier: string
    otpType: 'email' | 'phone'
  }>({
    defaultValues: {
      identifier: '',
      otpType: 'email',
    },
  })

  const watchedIdentifier = watch('identifier')
  const watchedOtpType = watch('otpType')

  const onSubmitSendOTP = async (data: { identifier: string; otpType: 'email' | 'phone' }) => {
    setError(null)
    setSuccess(null)
    
    const otpData: SendOTPData = {
      identifier: data.identifier,
      otpType: data.otpType,
      purpose: 'login'
    }
    
    const result = await sendOTP(otpData)
    
    if (result.success) {
      setSuccess('ส่ง OTP เรียบร้อยแล้ว')
      setIdentifier(data.identifier)
      setOtpType(data.otpType)
      setShowOTPVerification(true)
    } else {
      setError(result.message || 'ไม่สามารถส่ง OTP ได้')
    }
  }

  const handleOTPVerified = (data?: any) => {
    if (data?.accessToken) {
      // OTP verification included login, so we're done
      onSuccess()
    } else {
      // Need to complete login with OTP
      completeLogin()
    }
  }

  const completeLogin = async () => {
    const credentials: LoginWithOTPCredentials = {
      identifier,
      otpCode: '', // This will be filled by the OTP verification component
    }
    
    const result = await loginWithOTP(credentials)
    
    if (result.success) {
      onSuccess()
    } else {
      setError(result.message || 'การเข้าสู่ระบบด้วย OTP ไม่สำเร็จ')
      setShowOTPVerification(false)
    }
  }

  const handleCancelOTP = () => {
    setShowOTPVerification(false)
    setIdentifier('')
    setValue('identifier', '')
  }

  if (showOTPVerification) {
    return (
      <div className="max-w-md w-full mx-auto">
        <OTPVerification
          identifier={identifier}
          purpose="login"
          onVerified={handleOTPVerified}
          onCancel={handleCancelOTP}
          title="เข้าสู่ระบบด้วย OTP"
          description="กรุณากรอกรหัส OTP ที่ได้รับเพื่อเข้าสู่ระบบ"
        />
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">เข้าสู่ระบบด้วย OTP</h2>
        <p className="text-secondary-600 mb-6">
          กรุณาระบุอีเมลหรือเบอร์โทรศัพท์เพื่อรับรหัส OTP
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

      <form onSubmit={handleSubmit(onSubmitSendOTP)} className="space-y-6">
        <div>
          <div className="flex items-center justify-center space-x-4 mb-4">
            <label className="flex items-center">
              <input
                {...register('otpType')}
                type="radio"
                value="email"
                className="mr-2"
              />
              <span className="text-sm text-secondary-700">อีเมล</span>
            </label>
            <label className="flex items-center">
              <input
                {...register('otpType')}
                type="radio"
                value="phone"
                className="mr-2"
              />
              <span className="text-sm text-secondary-700">เบอร์โทรศัพท์</span>
            </label>
          </div>

          <label htmlFor="identifier" className="block text-sm font-medium text-secondary-700 mb-2">
            {watchedOtpType === 'email' ? 'อีเมล' : 'เบอร์โทรศัพท์'}
          </label>
          <input
            {...register('identifier', { 
              required: 'กรุณาระบุ' + (watchedOtpType === 'email' ? 'อีเมล' : 'เบอร์โทรศัพท์'),
              pattern: watchedOtpType === 'email' 
                ? {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'รูปแบบอีเมลไม่ถูกต้อง'
                  }
                : {
                    value: /^[0-9]{10}$/,
                    message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก'
                  }
            })}
            type={watchedOtpType === 'email' ? 'email' : 'tel'}
            inputMode={watchedOtpType === 'email' ? 'email' : 'numeric'}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder={watchedOtpType === 'email' ? 'example@email.com' : '08xxxxxxxx'}
          />
          {errors.identifier && (
            <p className="mt-2 text-sm text-danger-600">{errors.identifier.message}</p>
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
            disabled={isLoading || !watchedIdentifier}
            className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังส่ง OTP...
              </>
            ) : (
              'ขอรหัส OTP'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}