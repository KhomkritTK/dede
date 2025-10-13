'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  BellIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface OfficerLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'แดชบอร์ด', href: '/eservice/dede/officer/dashboard', icon: HomeIcon },
  { name: 'คำขอใบอนุญาต', href: '/eservice/dede/officer/licenses', icon: DocumentTextIcon },
  { name: 'การตรวจสอบ', href: '/eservice/dede/officer/inspections', icon: ClipboardDocumentCheckIcon },
  { name: 'รายงานตรวจสอบ', href: '/eservice/dede/officer/audits', icon: DocumentMagnifyingGlassIcon },
  { name: 'การแจ้งเตือน', href: '/eservice/dede/officer/notifications', icon: BellIcon },
  { name: 'โปรไฟล์', href: '/eservice/dede/officer/profile', icon: UserIcon },
]

export default function OfficerLayout({ children }: OfficerLayoutProps) {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    // Check if user has admin or DEDE role
    if (isAuthenticated && user) {
      const isAdminOrDEDE = user.role === 'admin' || 
                           user.role === 'dede_head' || 
                           user.role === 'dede_staff' || 
                           user.role === 'dede_consult' || 
                           user.role === 'auditor'
      
      if (!isAdminOrDEDE) {
        router.push('/eservice/dede')
      }
    }
  }, [isAuthenticated, user, router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (!isAuthenticated) {
    return null
  }

  if (isAuthenticated && user) {
    const isAdminOrDEDE = user.role === 'admin' || 
                         user.role === 'dede_head' || 
                         user.role === 'dede_staff' || 
                         user.role === 'dede_consult' || 
                         user.role === 'auditor'
    
    if (!isAdminOrDEDE) {
      return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
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
          <Sidebar />
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:hidden">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 flex justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <HomeIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                    placeholder="DEDE E-Service - Officer"
                    type="search"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {navigation.find(item => item.href === pathname)?.name || 'DEDE E-Service - Officer'}
                </h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">สวัสดี, {user?.firstName} {user?.lastName}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                    ออกจากระบบ
                  </button>
                </div>
              </div>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function Sidebar() {
  const pathname = usePathname()
  
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-blue-700">
      <div className="flex items-center flex-shrink-0 px-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">DE</span>
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-white text-lg font-semibold">DEDE E-Service</h1>
            <p className="text-blue-200 text-xs">เจ้าหน้าที่</p>
          </div>
        </div>
      </div>
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/eservice/dede/officer/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                isActive
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-600 hover:text-white'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              <item.icon
                className={`${
                  isActive ? 'text-blue-300' : 'text-blue-400 group-hover:text-blue-300'
                } mr-3 flex-shrink-0 h-6 w-6`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="flex-shrink-0 flex border-t border-blue-800 p-4">
        <Link href="/eservice/dede" className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div>
              <svg className="h-6 w-6 text-blue-400 group-hover:text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">กลับสู่หน้าหลัก</p>
              <p className="text-xs font-medium text-blue-200">หน้าสำหรับผู้ใช้ทั่วไป</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}