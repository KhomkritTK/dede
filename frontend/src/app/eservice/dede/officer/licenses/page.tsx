'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function OfficerLicensesPage() {
  const { user } = useAuth()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">จัดการคำขอใบอนุญาต</h1>
        <p className="mt-1 text-sm text-gray-600">
          ตรวจสอบและอนุมัติคำขอใบอนุญาตสำหรับพลังงานทดแทน
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">ยังไม่มีคำขอใบอนุญาต</h3>
          <p className="mt-1 text-sm text-gray-500">
            คำขอใบอนุญาตที่รอการตรวจสอบจะแสดงที่นี่
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