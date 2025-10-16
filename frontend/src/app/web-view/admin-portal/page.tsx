'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function WebViewAdminPortalPage() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/?redirect=web-view/admin-portal')
        return
      }
      
      // Check if user has admin privileges
      if (user?.role?.includes('admin') || user?.role === 'system_admin' || user?.role === 'dede_head_admin' || user?.role === 'dede_staff_admin' || user?.role === 'dede_consult_admin' || user?.role === 'auditor_admin') {
        // Redirect to admin dashboard
        router.push('/admin-portal/dashboard')
      } else {
        // If user is not an admin, redirect to main page
        router.push('/?error=access_denied')
      }
    }
  }, [isAuthenticated, isLoading, router, user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">กำลังนำทางไปยังแดชบอร์ดผู้ดูแลระบบ...</p>
      </div>
    </div>
  )
}