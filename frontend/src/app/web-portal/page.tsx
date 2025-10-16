'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePortalAuth } from '@/hooks/usePortalAuth'

export default function WebPortalPage() {
  const { isAuthenticated, user, isLoading } = usePortalAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/?redirect=web-portal')
        return
      }
      
      // Redirect to appropriate page based on user role
      if (user?.role === 'admin' || 
          user?.role === 'system_admin' ||
          user?.role === 'dede_head_admin' ||
          user?.role === 'dede_staff_admin' ||
          user?.role === 'dede_consult_admin' ||
          user?.role === 'auditor_admin') {
        router.push('/admin-portal/dashboard')
      } else if (user?.role === 'dede_head' ||
                 user?.role === 'dede_staff' ||
                 user?.role === 'dede_consult' ||
                 user?.role === 'auditor') {
        router.push('/eservice/dede/officer/dashboard')
      } else {
        // If user doesn't have portal access, redirect to main page
        router.push('/?error=invalid_portal_role')
      }
    }
  }, [isAuthenticated, isLoading, router, user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">กำลังนำทางไปยัง Web Portal...</p>
      </div>
    </div>
  )
}