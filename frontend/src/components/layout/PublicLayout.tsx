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
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/eservice/dede/home" className="flex items-center">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">DE</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">DEDE E-Service</h1>
                    <p className="text-xs text-gray-500">ระบบบริการอิเล็กทรอนิกส์</p>
                  </div>
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
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