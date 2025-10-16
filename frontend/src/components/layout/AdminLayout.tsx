'use client'

import { useState } from 'react'
import { usePortalAuth } from '@/hooks/usePortalAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  CogIcon,
} from '@heroicons/react/24/outline'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = usePortalAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/')
    // Force a page refresh to ensure the main page loads with fresh state
    window.location.href = '/'
  }

  const navigation = [
    {
      name: 'แดชบอร์ด',
      href: '/admin-portal/dashboard',
      icon: HomeIcon,
      current: pathname === '/admin-portal/dashboard',
    },
    {
      name: 'จัดการคำขอ',
      href: '/admin-portal/services',
      icon: DocumentTextIcon,
      current: pathname.startsWith('/admin-portal/services'),
    },
    {
      name: 'ติดตามการดำเนินการ',
      href: '/admin-portal/flow',
      icon: ClipboardDocumentCheckIcon,
      current: pathname.startsWith('/admin-portal/flow'),
    },
    {
      name: 'รายงานและสถิติ',
      href: '/admin-portal/reports',
      icon: ChartBarIcon,
      current: pathname.startsWith('/admin-portal/reports'),
    },
    {
      name: 'จัดการผู้ใช้',
      href: '/admin-portal/users',
      icon: UserGroupIcon,
      current: pathname.startsWith('/admin-portal/users'),
    },
    {
      name: 'ตั้งค่าระบบ',
      href: '/admin-portal/settings',
      icon: CogIcon,
      current: pathname.startsWith('/admin-portal/settings'),
    },
    {
      name: 'โปรไฟล์',
      href: '/admin-portal/profile',
      icon: UserIcon,
      current: pathname.startsWith('/admin-portal/profile'),
    },
  ]

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'system_admin':
        return 'ผู้ดูแลระบบ'
      case 'dede_head_admin':
        return 'ผู้บริหาร DEDE'
      case 'dede_staff_admin':
        return 'เจ้าหน้าที่ DEDE'
      case 'dede_consult_admin':
        return 'ที่ปรึกษา DEDE'
      case 'auditor_admin':
        return 'ผู้ตรวจสอบ'
      case 'admin':
        return 'ผู้ดูแลระบบ'
      default:
        return role
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-gray-600 transition-opacity ${sidebarOpen ? 'opacity-75' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />

        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AD</span>
              </div>
              <h1 className="ml-3 text-lg font-semibold text-gray-900">Admin Portal</h1>
            </div>
            <nav className="mt-8 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? 'bg-red-100 text-red-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      item.current ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-bold text-lg">
                    {user?.fullName?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs font-medium text-gray-500">{getRoleDisplayName(user?.role || '')}</p>
                {user?.email && (
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                )}
              </div>
            </div>
            <div className="mt-3 w-full">
              <button
                onClick={handleLogout}
                className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4 py-6">
            <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">AD</span>
            </div>
            <h1 className="ml-3 text-lg font-semibold text-gray-900">Admin Portal</h1>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? 'bg-red-100 text-red-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    item.current ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-bold text-lg">
                  {user?.fullName?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs font-medium text-gray-500">{getRoleDisplayName(user?.role || '')}</p>
              {user?.email && (
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              )}
            </div>
          </div>
          <div className="mt-3 w-full">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}