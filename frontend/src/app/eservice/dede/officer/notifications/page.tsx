'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function OfficerNotificationsPage() {
  const { user } = useAuth()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">จัดการการแจ้งเตือน</h1>
        <p className="mt-1 text-sm text-gray-600">
          จัดการการแจ้งเตือนและประกาศสำหรับผู้ใช้งาน
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">ยังไม่มีการแจ้งเตือน</h3>
          <p className="mt-1 text-sm text-gray-500">
            การแจ้งเตือนที่สร้างขึ้นจะแสดงที่นี่
          </p>
          <div className="mt-6">
            <Link
              href="/eservice/dede/officer/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              กลับสู่แดชบอร์ด
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}