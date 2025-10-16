'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePortalAuth } from '@/hooks/usePortalAuth'
import OfficerLayout from '@/components/layout/OfficerLayout'

export default function OfficerLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, isLoading } = usePortalAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if not authenticated or not an officer
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login-portal') // Redirect to officer login page
        return
      }
      
      // Check if user is an officer (Web Portal user)
      const isOfficer = user?.role === 'admin' ||
                       user?.role === 'dede_head' ||
                       user?.role === 'dede_staff' ||
                       user?.role === 'dede_consult' ||
                       user?.role === 'auditor'
      
      if (!isOfficer) {
        router.push('/eservice/dede') // Redirect to Web View
        return
      }
    }
  }, [isAuthenticated, isLoading, router, user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่ได้เข้าสู่ระบบ</h1>
          <p className="text-gray-600">กรุณาเข้าสู่ระบบเพื่อเข้าใช้งาน Web Portal</p>
        </div>
      </div>
    )
  }

  return <OfficerLayout>{children}</OfficerLayout>
}