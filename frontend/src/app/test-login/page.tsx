'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePortalAuth } from '@/hooks/usePortalAuth'
import { useRouter } from 'next/navigation'
import LoginStatus from '@/components/auth/LoginStatus'

export default function TestLoginPage() {
  const { login: webViewLogin, logout: webViewLogout, user: webViewUser, isAuthenticated: isWebViewAuth } = useAuth()
  const { login: portalLogin, logout: portalLogout, user: portalUser, isAuthenticated: isPortalAuth } = usePortalAuth()
  const router = useRouter()
  
  const [webViewCredentials, setWebViewCredentials] = useState({ username: '', password: '' })
  const [portalCredentials, setPortalCredentials] = useState({ username: '', password: '' })
  const [webViewLoading, setWebViewLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const handleWebViewLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setWebViewLoading(true)
    await webViewLogin(webViewCredentials.username, webViewCredentials.password)
    setWebViewLoading(false)
  }

  const handlePortalLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setPortalLoading(true)
    await portalLogin(portalCredentials.username, portalCredentials.password)
    setPortalLoading(false)
  }

  const handleWebViewLogout = async () => {
    await webViewLogout()
  }

  const handlePortalLogout = async () => {
    await portalLogout()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          ทดสอบการเข้าสู่ระบบพร้อมกัน (Simultaneous Login Test)
        </h1>

        <LoginStatus />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Web View Login Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Web View Login</h2>
            
            {!isWebViewAuth ? (
              <form onSubmit={handleWebViewLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อผู้ใช้
                  </label>
                  <input
                    type="text"
                    value={webViewCredentials.username}
                    onChange={(e) => setWebViewCredentials(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="กรอกชื่อผู้ใช้"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสผ่าน
                  </label>
                  <input
                    type="password"
                    value={webViewCredentials.password}
                    onChange={(e) => setWebViewCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="กรอกรหัสผ่าน"
                  />
                </div>
                <button
                  type="submit"
                  disabled={webViewLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {webViewLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ Web View'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">
                    เข้าสู่ระบบแล้ว: {webViewUser?.fullName} ({webViewUser?.role})
                  </p>
                </div>
                <button
                  onClick={handleWebViewLogout}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                >
                  ออกจากระบบ Web View
                </button>
                {webViewUser?.role === 'user' && (
                  <button
                    onClick={() => router.push('/eservice/dede')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    ไปที่หน้า Web View
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Web Portal Login Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-green-600 mb-4">Web Portal Login</h2>
            
            {!isPortalAuth ? (
              <form onSubmit={handlePortalLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อผู้ใช้
                  </label>
                  <input
                    type="text"
                    value={portalCredentials.username}
                    onChange={(e) => setPortalCredentials(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="กรอกชื่อผู้ใช้"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสผ่าน
                  </label>
                  <input
                    type="password"
                    value={portalCredentials.password}
                    onChange={(e) => setPortalCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="กรอกรหัสผ่าน"
                  />
                </div>
                <button
                  type="submit"
                  disabled={portalLoading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {portalLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ Web Portal'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">
                    เข้าสู่ระบบแล้ว: {portalUser?.fullName} ({portalUser?.role})
                  </p>
                </div>
                <button
                  onClick={handlePortalLogout}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                >
                  ออกจากระบบ Web Portal
                </button>
                {(portalUser?.role === 'admin' || 
                  portalUser?.role === 'dede_head' || 
                  portalUser?.role === 'dede_staff' || 
                  portalUser?.role === 'dede_consult' || 
                  portalUser?.role === 'auditor') && (
                  <button
                    onClick={() => router.push('/eservice/dede/officer/dashboard')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    ไปที่หน้า Web Portal
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">วิธีการทดสอบ:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
            <li>เข้าสู่ระบบ Web View ด้วยบัญชีผู้ใช้ทั่วไป (role: user)</li>
            <li>เข้าสู่ระบบ Web Portal ด้วยบัญชีเจ้าหน้าที่ (role: admin, dede_head, etc.)</li>
            <li>สังเกตว่าสามารถเข้าสู่ระบบได้พร้อมกันทั้งสองระบบ</li>
            <li>ทดสอบการออกจากระบบแต่ละระบบ - การออกจากระบบหนึ่งไม่กระทบอีกระบบหนึ่ง</li>
            <li>สามารถนำทางไปยังหน้าต่างๆ ของแต่ละระบบได้ตามบทบาทของผู้ใช้</li>
          </ol>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700"
          >
            กลับไปหน้าหลัก
          </button>
        </div>
      </div>
    </div>
  )
}