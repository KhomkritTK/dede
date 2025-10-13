'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { VerifyOTPData, ResendOTPData } from '@/types'

interface OTPVerificationProps {
  identifier: string
  purpose: string
  onVerified: (data?: any) => void
  onCancel: () => void
  title?: string
  description?: string
}

export default function OTPVerification({ 
  identifier, 
  purpose, 
  onVerified, 
  onCancel,
  title = "ยืนยันรหัส OTP",
  description = "กรุณากรอกรหัส OTP ที่ได้รับทางอีเมลหรือ SMS"
}: OTPVerificationProps) {
  const { verifyOTP, resendOTP, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VerifyOTPData>({
    defaultValues: {
      identifier,
      code: '',
      purpose,
    },
  })

  const otpCode = watch('code')

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const onSubmit = async (data: VerifyOTPData) => {
    setError(null)
    setSuccess(null)
    
    const result = await verifyOTP(data)
    
    if (result.success) {
      setSuccess('การยืนยัน OTP สำเร็จ')
      setTimeout(() => {
        onVerified(result.data)
      }, 1000)
    } else {
      setError(result.message || 'การยืนยัน OTP ไม่สำเร็จ')
    }
  }

  const handleResendOTP = async () => {
    setError(null)
    setResendSuccess(null)
    
    const result = await resendOTP({ identifier, purpose })
    
    if (result.success) {
      setResendSuccess('ส่ง OTP ใหม่เรียบร้อยแล้ว')
      setTimeLeft(60)
      setCanResend(false)
      setValue('code', '')
    } else {
      setError(result.message || 'ไม่สามารถส่ง OTP ใหม่ได้')
    }
  }

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Only allow numbers
    setValue('code', value)
  }

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">{title}</h2>
        <p className="text-secondary-600 mb-6">{description}</p>
        <p className="text-sm text-secondary-500 mb-6">
          ส่งไปที่: {identifier}
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

      {resendSuccess && (
        <div className="rounded-md bg-info-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-info-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-info-800">{resendSuccess}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-secondary-700 mb-2">
            รหัส OTP (6 หลัก)
          </label>
          <div className="flex justify-center">
            <input
              {...register('code', { 
                required: 'กรุณากรอกรหัส OTP',
                pattern: {
                  value: /^\d{6}$/,
                  message: 'รหัส OTP ต้องเป็นตัวเลข 6 หลัก'
                }
              })}
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="w-full max-w-xs text-center text-2xl font-bold tracking-widest px-4 py-3 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="000000"
              onChange={handleOTPChange}
              value={otpCode}
            />
          </div>
          {errors.code && (
            <p className="mt-2 text-sm text-danger-600 text-center">{errors.code.message}</p>
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
            disabled={isLoading || otpCode?.length !== 6}
            className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังยืนยัน...
              </>
            ) : (
              'ยืนยัน'
            )}
          </button>
        </div>

        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isLoading}
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              ส่ง OTP ใหม่
            </button>
          ) : (
            <p className="text-sm text-secondary-500">
              ส่ง OTP ใหม่ได้ใน <span className="font-medium">{timeLeft}</span> วินาที
            </p>
          )}
        </div>
      </form>
    </div>
  )
}