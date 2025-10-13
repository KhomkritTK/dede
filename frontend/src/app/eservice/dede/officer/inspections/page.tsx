'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function OfficerInspectionsPage() {
  const { user } = useAuth()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">จัดการการตรวจสอบ</h1>
        <p className="mt-1 text-sm text-gray-600">
          จัดการกำหนดการและผลการตรวจสอบสถานที่ติดตั้งพลังงานทดแทน
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">ยังไม่มีการตรวจสอบ</h3>
          <p className="mt-1 text-sm text-gray-500">
            การตรวจสอบที่รอการดำเนินการจะแสดงที่นี่
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