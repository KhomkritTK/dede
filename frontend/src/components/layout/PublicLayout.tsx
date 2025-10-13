'use client'

import { useState, ReactNode } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface PublicLayoutProps {
  children: ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/eservice/dede')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/eservice/dede" className="flex items-center">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">DE</span>
                  </div>
                  <h1 className="ml-3 text-xl font-semibold text-gray-900">DEDE E-Service</h1>
                </Link>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/eservice/dede/home" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  หน้าแรก
                </Link>
                <Link href="/eservice/dede/services" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  บริการ
                </Link>
                <Link href="/eservice/dede/about" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  เกี่ยวกับเรา
                </Link>
                <Link href="/eservice/dede/contact" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  ติดต่อเรา
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                {isAuthenticated ? (
                  <>
                    <span className="text-gray-500 px-3 py-2 rounded-md text-sm font-medium">
                      สวัสดี, {user?.firstName} {user?.lastName}
                    </span>
                    
                    {/* Show different options based on user role */}
                    {(user?.role === 'admin' || 
                      user?.role === 'dede_head' || 
                      user?.role === 'dede_staff' || 
                      user?.role === 'dede_consult' || 
                      user?.role === 'auditor') && (
                      <Link
                        href="/eservice/dede/officer/dashboard"
                        className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        จัดการระบบ
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      ออกจากระบบ
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                      เข้าสู่ระบบ
                    </Link>
                    <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                      สมัครสมาชิก
                    </Link>
                  </>
                )}
              </div>
              <div className="sm:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {!isMenuOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link href="/eservice/dede/home" className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                หน้าแรก
              </Link>
              <Link href="/eservice/dede/services" className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                บริการ
              </Link>
              <Link href="/eservice/dede/about" className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                เกี่ยวกับเรา
              </Link>
              <Link href="/eservice/dede/contact" className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                ติดต่อเรา
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="flex items-center px-4 space-y-2">
                  <div className="flex-shrink-0">
                    <span className="text-gray-500 px-3 py-2 rounded-md text-sm font-medium">
                      สวัสดี, {user?.firstName} {user?.lastName}
                    </span>
                  </div>
                  
                  {/* Show different options based on user role */}
                  {(user?.role === 'admin' || 
                    user?.role === 'dede_head' || 
                    user?.role === 'dede_staff' || 
                    user?.role === 'dede_consult' || 
                    user?.role === 'auditor') && (
                    <div className="flex-shrink-0">
                      <Link
                        href="/eservice/dede/officer/dashboard"
                        className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        จัดการระบบ
                      </Link>
                    </div>
                  )}
                  
                  <div className="flex-shrink-0">
                    <button
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Link href="/login" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                      เข้าสู่ระบบ
                    </Link>
                  </div>
                  <div className="ml-3">
                    <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                      สมัครสมาชิก
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">DE</span>
                  </div>
                </div>
                <h3 className="ml-3 text-xl font-semibold text-white">DEDE E-Service</h3>
              </div>
              <p className="text-gray-300 text-base">
                ระบบบริการอิเล็กทรอนิกส์ กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    บริการ
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link href="/eservice/dede/services" className="text-base text-gray-300 hover:text-white">
                        คำขอใบอนุญาต
                      </Link>
                    </li>
                    <li>
                      <Link href="/eservice/dede/services" className="text-base text-gray-300 hover:text-white">
                        ติดตามสถานะ
                      </Link>
                    </li>
                    <li>
                      <Link href="/eservice/dede/services" className="text-base text-gray-300 hover:text-white">
                        ดาวน์โหลดเอกสาร
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    ข้อมูล
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link href="/eservice/dede/about" className="text-base text-gray-300 hover:text-white">
                        เกี่ยวกับเรา
                      </Link>
                    </li>
                    <li>
                      <Link href="/eservice/dede/contact" className="text-base text-gray-300 hover:text-white">
                        ติดต่อเรา
                      </Link>
                    </li>
                    <li>
                      {isAuthenticated ? (
                        <button
                          onClick={handleLogout}
                          className="text-base text-gray-300 hover:text-white"
                        >
                          ออกจากระบบ
                        </button>
                      ) : (
                        <Link href="/login" className="text-base text-gray-300 hover:text-white">
                          เข้าสู่ระบบ
                        </Link>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; 2023 กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน. สงวนลิขสิทธิ์.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}