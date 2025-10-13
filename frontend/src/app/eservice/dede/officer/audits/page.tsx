'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function OfficerAuditsPage() {
  const { user } = useAuth()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">จัดการรายงานตรวจสอบ</h1>
        <p className="mt-1 text-sm text-gray-600">
          ตรวจสอบและอนุมัติรายงานการตรวจสอบพลังงานทดแทน
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">ยังไม่มีรายงานตรวจสอบ</h3>
          <p className="mt-1 text-sm text-gray-500">
            รายงานตรวจสอบที่รอการพิจารณาจะแสดงที่นี่
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