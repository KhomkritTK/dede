'use client'

import { usePortalAuth } from '@/hooks/usePortalAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user, isLoading } = usePortalAuth()
  const router = useRouter()
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (!isLoading && !hasRedirected.current) {
      if (!isAuthenticated) {
        hasRedirected.current = true
        router.push('/')
        return
      }

      // Check if user has admin role
      const adminRoles = ['admin', 'system_admin', 'dede_head_admin', 'dede_staff_admin', 'dede_consult_admin', 'auditor_admin']
      if (user && !adminRoles.includes(user.role)) {
        hasRedirected.current = true
        router.push('/eservice/dede')
        return
      }
    }
  }, [isAuthenticated, user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <AdminLayout>{children}</AdminLayout>
}