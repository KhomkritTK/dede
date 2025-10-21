'use client'

import { useState, ReactNode } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { usePortalAuth } from '@/hooks/usePortalAuth'
import { useRouter } from 'next/navigation'

interface PublicLayoutProps {
  children: ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const { user: portalUser, isAuthenticated: isPortalAuth, logout: portalLogout } = usePortalAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Get the current authenticated user from either auth system
  const currentUser = portalUser || user
  const isUserAuthenticated = isAuthenticated || isPortalAuth

  const handleLogout = async () => {
    // Logout from both systems
    if (isPortalAuth) {
      await portalLogout()
    }
    if (isAuthenticated) {
      await logout()
    }
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      {isUserAuthenticated && (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/eservice/dede/home" className="flex items-center hover:opacity-80 transition-opacity">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">DE</span>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-gray-900">DEDE E-Service</h1>
                    <p className="text-xs text-gray-500">ระบบบริการอิเล็กทรอนิกส์</p>
                  </div>
                  <div className="sm:hidden">
                    <h1 className="text-lg font-bold text-gray-900">DEDE</h1>
                  </div>
                </Link>
              </div>
              
              {/* Desktop Quick Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/eservice/dede/home"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  🏠 หน้าแรก
                </Link>
                <div className="relative group">
                  <button className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                    📋 บริการ
                    <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <Link href="/eservice/dede/license/new" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        📄 ขอรับใบอนุญาตใหม่
                      </Link>
                      <Link href="/eservice/dede/license/renewal" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        🔄 ขอต่ออายุใบอนุญาต
                      </Link>
                      <Link href="/eservice/dede/license/extension" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        📈 ขอขยายการผลิต
                      </Link>
                      <Link href="/eservice/dede/license/reduction" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        📉 ขอลดการผลิต
                      </Link>
                    </div>
                  </div>
                </div>
                <a
                  href="#"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    const element = document.querySelector('#document-status') as HTMLElement
                    window.scrollTo({ top: element?.offsetTop || 0, behavior: 'smooth' })
                  }}
                >
                  📊 สถานะเอกสาร
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                  }}
                >
                  📞 ติดต่อเรา
                </a>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Desktop User Info */}
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {currentUser?.fullName || currentUser?.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentUser?.role === 'corporate' ? 'นิติบุคคล' :
                       currentUser?.role === 'individual' ? 'บุคคลธรรมดา' :
                       currentUser?.role || 'ผู้ใช้งาน'}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {(currentUser?.fullName || currentUser?.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  >
                    <span className="sr-only">Open main menu</span>
                    {isMenuOpen ? (
                      <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Desktop Logout Button */}
                <div className="hidden md:block">
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  href="/eservice/dede/home"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🏠 หน้าแรก
                </Link>
                <div className="px-3 py-2">
                  <p className="text-base font-medium text-gray-900 mb-2">📋 บริการ</p>
                  <div className="pl-4 space-y-1">
                    <Link
                      href="/eservice/dede/license/new"
                      className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      📄 ขอรับใบอนุญาตใหม่
                    </Link>
                    <Link
                      href="/eservice/dede/license/renewal"
                      className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🔄 ขอต่ออายุใบอนุญาต
                    </Link>
                    <Link
                      href="/eservice/dede/license/extension"
                      className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      📈 ขอขยายการผลิต
                    </Link>
                    <Link
                      href="/eservice/dede/license/reduction"
                      className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      📉 ขอลดการผลิต
                    </Link>
                  </div>
                </div>
                <a
                  href="#"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  onClick={(e) => {
                    e.preventDefault()
                    const element = document.querySelector('#document-status') as HTMLElement
                    window.scrollTo({ top: element?.offsetTop || 0, behavior: 'smooth' })
                    setIsMenuOpen(false)
                  }}
                >
                  📊 สถานะเอกสาร
                </a>
                <a
                  href="#"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  onClick={(e) => {
                    e.preventDefault()
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                    setIsMenuOpen(false)
                  }}
                >
                  📞 ติดต่อเรา
                </a>
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="px-2">
                  <div className="flex items-center px-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {(currentUser?.fullName || currentUser?.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {currentUser?.fullName || currentUser?.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {currentUser?.role === 'corporate' ? 'นิติบุคคล' :
                         currentUser?.role === 'individual' ? 'บุคคลธรรมดา' :
                         currentUser?.role || 'ผู้ใช้งาน'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 px-2">
                    <button
                      onClick={handleLogout}
                      className="block w-full px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      <svg className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>
      )}
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold">DE</span>
                </div>
                <span className="text-xl font-bold">DEDE E-Service</span>
              </div>
              <p className="text-gray-400 text-sm">
                ระบบบริการอิเล็กทรอนิกส์สำหรับการจัดการคำขอใบอนุญาตพลังงานทดแทนและอนุรักษ์พลังงาน
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">บริการของเรา</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">ขอรับใบอนุญาตใหม่</a></li>
                <li><a href="#" className="hover:text-white">ขอต่ออายุใบอนุญาต</a></li>
                <li><a href="#" className="hover:text-white">ขอขยายการผลิต</a></li>
                <li><a href="#" className="hover:text-white">ขอลดการผลิต</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">ข้อมูลเพิ่มเติม</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">คู่มือการใช้งาน</a></li>
                <li><a href="#" className="hover:text-white">ข้อบังคับและเงื่อนไข</a></li>
                <li><a href="#" className="hover:text-white">นโยบายความเป็นส่วนตัว</a></li>
                <li><a href="#" className="hover:text-white">คำถามที่พบบ่อย</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">ติดต่อเรา</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>โทร: 02-123-4567</li>
                <li>อีเมล: info@dede.go.th</li>
                <li>ที่อยู่: กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>&copy; 2024 กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน. สงวนลิขสิทธิ์</p>
          </div>
        </div>
      </footer>
    </div>
  )
}