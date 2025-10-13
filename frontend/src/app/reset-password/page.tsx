'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import PasswordReset from '@/components/auth/PasswordReset'

export default function ResetPasswordPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    // Get message from URL params
    const msg = searchParams.get('message')
    if (msg) {
      switch (msg) {
        case 'password_changed':
          setMessage('เปลี่ยนรหัสผ่านสำเร็จแล้ว กรุณาเข้าสู่ระบบใหม่')
          break
        case 'session_expired':
          setMessage('หมดเวลาใช้งาน กรุณาเข้าสู่ระบบใหม่')
          break
        default:
          setMessage(null)
      }
    }
  }, [searchParams])

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSuccess = () => {
    // Show success message and redirect to login
    router.push('/login?message=password_reset')
  }

  const handleCancel = () => {
    // Redirect to login page
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {message && (
          <div className="rounded-md bg-info-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-info-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-info-800">{message}</p>
              </div>
            </div>
          </div>
        )}
        
        <PasswordReset
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}