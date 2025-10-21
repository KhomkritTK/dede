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