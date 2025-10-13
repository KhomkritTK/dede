'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import PublicLayout from '@/components/layout/PublicLayout'
import Link from 'next/link'
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

interface UserRequest {
  id: string
  requestNumber: string
  type: 'new_license' | 'renewal' | 'extension' | 'reduction'
  title: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  submittedDate: string
  lastUpdated: string
}

export default function UserDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<UserRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(true)

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    // Fetch user requests
    if (isAuthenticated) {
      // Simulate API call to fetch user requests
      setTimeout(() => {
        setRequests([
          {
            id: '1',
            requestNumber: 'REQ-2023-001',
            type: 'new_license',
            title: 'คำขอใบอนุญาตผลิตไฟฟ้าจากพลังงานแสงอาทิตย์',
            status: 'under_review',
            submittedDate: '2023-10-01',
            lastUpdated: '2023-10-05'
          },
          {
            id: '2',
            requestNumber: 'REQ-2023-002',
            type: 'renewal',
            title: 'คำขอต่ออายุใบอนุญาตผลิตไฟฟ้าจากพลังงานลม',
            status: 'approved',
            submittedDate: '2023-09-15',
            lastUpdated: '2023-09-20'
          }
        ])
        setRequestsLoading(false)
      }, 1000)
    }
  }, [isAuthenticated])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <ClockIcon className="h-5 w-5 text-gray-400" />
      case 'submitted':
        return <ClockIcon className="h-5 w-5 text-blue-500" />
      case 'under_review':
        return <ClipboardDocumentCheckIcon className="h-5 w-5 text-yellow-500" />
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'ร่าง'
      case 'submitted':
        return 'ส่งแล้ว'
      case 'under_review':
        return 'อยู่ระหว่างตรวจสอบ'
      case 'approved':
        return 'อนุมัติ'
      case 'rejected':
        return 'ปฏิเสธ'
      default:
        return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'new_license':
        return 'ขอรับใบอนุญาต'
      case 'renewal':
        return 'ขอต่ออายุใบอนุญาต'
      case 'extension':
        return 'ขอขยายการผลิต'
      case 'reduction':
        return 'ขอลดการผลิต'
      default:
        return type
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 font-sans">แดชบอร์ดของฉัน</h1>
          <p className="mt-3 text-lg text-gray-600 font-sans">
            จัดการและติดตามคำขอใบอนุญาตพลังงานทดแทนของคุณ
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow-xl rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 font-sans">ดำเนินการเร็ว</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/eservice/dede/license/new"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              ขอรับใบอนุญาตใหม่
            </Link>
            <Link
              href="/eservice/dede/license/renewal"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              ขอต่ออายุ
            </Link>
            <Link
              href="/eservice/dede/license/extension"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 shadow-md transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              ขอขยายการผลิต
            </Link>
            <Link
              href="/eservice/dede/license/reduction"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-md transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              ขอลดการผลิต
            </Link>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="px-6 py-5 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-xl font-semibold text-gray-900 font-sans">คำขอล่าสุด</h3>
          </div>
          <div className="overflow-hidden">
            {requestsLoading ? (
              <div className="px-6 py-10 sm:p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-sans">กำลังโหลดข้อมูล...</p>
              </div>
            ) : requests.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {requests.map((request) => (
                  <li key={request.id}>
                    <Link href={`/eservice/dede/license/${request.id}`} className="block hover:bg-gray-50 transition-colors duration-150">
                      <div className="px-6 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-4">
                              {getStatusIcon(request.status)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-blue-600 font-sans">
                                {request.requestNumber}
                              </p>
                              <p className="text-base font-medium text-gray-900 font-sans">
                                {request.title}
                              </p>
                              <div className="flex items-center mt-2">
                                <span className="text-xs text-gray-500 mr-2 font-sans">
                                  {getTypeText(request.type)}
                                </span>
                                <span className="text-xs text-gray-500 font-sans">
                                  ส่งเมื่อ {request.submittedDate}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium font-sans ${
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              request.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {getStatusText(request.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-10 sm:p-6 text-center">
                <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 font-sans">ไม่มีคำขอ</h3>
                <p className="mt-2 text-base text-gray-600 font-sans">
                  คุณยังไม่ได้ส่งคำขอใดๆ เริ่มต้นโดยสร้างคำขอใบอนุญาตใหม่
                </p>
                <div className="mt-8">
                  <Link
                    href="/eservice/dede/license/new"
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-md text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    สร้างคำขอใหม่
                  </Link>
                </div>
              </div>
            )}
          </div>
          {requests.length > 0 && (
            <div className="px-6 py-4 sm:px-6 bg-gray-50 text-right">
              <Link
                href="/eservice/dede/requests"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 font-sans"
              >
                ดูคำขอทั้งหมด <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}