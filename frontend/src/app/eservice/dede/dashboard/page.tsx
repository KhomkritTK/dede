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
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

interface UserRequest {
  id: string
  requestNumber: string
  type: 'new_license' | 'renewal' | 'extension' | 'reduction'
  title: string
  status: 'new_request' | 'accepted' | 'assigned' | 'appointment' | 'inspecting' | 'inspection_done' | 'document_edit' | 'report_approved' | 'approved' | 'rejected' | 'rejected_final' | 'returned' | 'forwarded'
  submittedDate: string
  lastUpdated: string
}

export default function UserDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<UserRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

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
      // Simulate API call to fetch user requests (reduced timeout for faster UX)
      setTimeout(() => {
        setRequests([
          {
            id: '1',
            requestNumber: 'REQ-2023-001',
            type: 'new_license',
            title: 'คำขอใบอนุญาตผลิตไฟฟ้าจากพลังงานแสงอาทิตย์',
            status: 'accepted',
            submittedDate: '2023-10-01',
            lastUpdated: '2023-10-05'
          },
          {
            id: '2',
            requestNumber: 'REQ-2023-002',
            type: 'renewal',
            title: 'คำขอต่ออายุใบอนุญาตผลิตไฟฟ้าจากพลังงานลม',
            status: 'assigned',
            submittedDate: '2023-09-15',
            lastUpdated: '2023-09-20'
          },
          {
            id: '3',
            requestNumber: 'REQ-2023-003',
            type: 'extension',
            title: 'คำขอขยายการผลิตพลังงานชีวมวล',
            status: 'inspecting',
            submittedDate: '2023-09-10',
            lastUpdated: '2023-09-25'
          },
          {
            id: '4',
            requestNumber: 'REQ-2023-004',
            type: 'reduction',
            title: 'คำขอลดการผลิตพลังงานน้ำ',
            status: 'document_edit',
            submittedDate: '2023-08-28',
            lastUpdated: '2023-09-05'
          }
        ])
        setRequestsLoading(false)
      }, 500) // Reduced from 1000ms to 500ms for faster loading
    }
  }, [isAuthenticated])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new_request':
        return <ClockIcon className="h-5 w-5 text-blue-500" />
      case 'accepted':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'assigned':
        return <ClipboardDocumentCheckIcon className="h-5 w-5 text-purple-500" />
      case 'appointment':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'inspecting':
        return <ClipboardDocumentCheckIcon className="h-5 w-5 text-orange-500" />
      case 'inspection_done':
        return <CheckCircleIcon className="h-5 w-5 text-teal-500" />
      case 'document_edit':
        return <ClipboardDocumentCheckIcon className="h-5 w-5 text-indigo-500" />
      case 'report_approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'rejected':
      case 'rejected_final':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'returned':
        return <ClockIcon className="h-5 w-5 text-amber-500" />
      case 'forwarded':
        return <ClipboardDocumentCheckIcon className="h-5 w-5 text-cyan-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new_request':
        return 'คำร้องใหม่'
      case 'accepted':
        return 'รับคำขอ'
      case 'assigned':
        return 'มอบหมายผู้ตรวจ'
      case 'appointment':
        return 'นัดหมาย'
      case 'inspecting':
        return 'เข้าตรวจสอบระบบ'
      case 'inspection_done':
        return 'ตรวจสอบเสร็จสิ้น'
      case 'document_edit':
        return 'แก้ไขเอกสาร'
      case 'report_approved':
        return 'รับรองรายงาน'
      case 'approved':
        return 'อนุมัติใบอนุญาต'
      case 'rejected':
        return 'ปฏิเสธคำขอ'
      case 'rejected_final':
        return 'ปฏิเสธสุดท้าย'
      case 'returned':
        return 'ตีเอกสารกลับไปแก้ไข'
      case 'forwarded':
        return 'ส่งต่อให้ DEDE Head'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new_request':
        return 'bg-blue-100 text-blue-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'assigned':
        return 'bg-purple-100 text-purple-800'
      case 'appointment':
        return 'bg-yellow-100 text-yellow-800'
      case 'inspecting':
        return 'bg-orange-100 text-orange-800'
      case 'inspection_done':
        return 'bg-teal-100 text-teal-800'
      case 'document_edit':
        return 'bg-indigo-100 text-indigo-800'
      case 'report_approved':
        return 'bg-green-100 text-green-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
      case 'rejected_final':
        return 'bg-red-100 text-red-800'
      case 'returned':
        return 'bg-amber-100 text-amber-800'
      case 'forwarded':
        return 'bg-cyan-100 text-cyan-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section removed as requested */}

        {/* Quick Actions */}
        <div className="bg-white shadow-xl rounded-xl p-6 mb-8 transform transition-all duration-300 hover:shadow-2xl hover-lift animate-fade-in">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center mr-3">
              <PlusIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-sans">ระบบการออกใบอนุญาตผลิตพลังงานควบคุม</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/eservice/dede/license/new"
              onMouseEnter={() => setHoveredCard('new')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`relative flex items-center justify-center px-4 py-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg transition-all duration-300 transform ${hoveredCard === 'new' ? 'scale-105 -translate-y-1' : ''}`}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              ขอรับใบอนุญาตใหม่
              {hoveredCard === 'new' && <ArrowRightIcon className="h-4 w-4 ml-2 animate-pulse" />}
            </Link>
            <Link
              href="/eservice/dede/license/renewal"
              onMouseEnter={() => setHoveredCard('renewal')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`relative flex items-center justify-center px-4 py-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transition-all duration-300 transform ${hoveredCard === 'renewal' ? 'scale-105 -translate-y-1' : ''}`}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              ขอต่ออายุ
              {hoveredCard === 'renewal' && <ArrowRightIcon className="h-4 w-4 ml-2 animate-pulse" />}
            </Link>
            <Link
              href="/eservice/dede/license/extension"
              onMouseEnter={() => setHoveredCard('extension')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`relative flex items-center justify-center px-4 py-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 shadow-lg transition-all duration-300 transform ${hoveredCard === 'extension' ? 'scale-105 -translate-y-1' : ''}`}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              ขอขยายการผลิต
              {hoveredCard === 'extension' && <ArrowRightIcon className="h-4 w-4 ml-2 animate-pulse" />}
            </Link>
            <Link
              href="/eservice/dede/license/reduction"
              onMouseEnter={() => setHoveredCard('reduction')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`relative flex items-center justify-center px-4 py-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg transition-all duration-300 transform ${hoveredCard === 'reduction' ? 'scale-105 -translate-y-1' : ''}`}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              ขอลดการผลิต
              {hoveredCard === 'reduction' && <ArrowRightIcon className="h-4 w-4 ml-2 animate-pulse" />}
            </Link>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover-lift animate-fade-in">
          <div className="px-6 py-5 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center mr-3">
                <DocumentTextIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 font-sans">คำขอล่าสุด</h3>
            </div>
          </div>
          <div className="overflow-hidden">
            {requestsLoading ? (
              <div className="px-6 py-10 sm:p-6 text-center">
                <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium font-sans">กำลังโหลดข้อมูล...</p>
              </div>
            ) : requests.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {requests.map((request) => (
                  <li key={request.id} className="transform transition-all duration-200 hover:bg-gray-50 hover:scale-[1.01]">
                    <Link href={`/eservice/dede/requests/${request.id}`} className="block">
                      <div className="px-6 py-5 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-4 p-2 bg-gray-50 rounded-lg">
                              {getStatusIcon(request.status)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-blue-600 font-sans">
                                {request.requestNumber}
                              </p>
                              <p className="text-base font-medium text-gray-900 font-sans mt-1">
                                {request.title}
                              </p>
                              <div className="flex items-center mt-2 space-x-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 font-sans">
                                  {getTypeText(request.type)}
                                </span>
                                <span className="text-xs text-gray-500 font-sans flex items-center">
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  ส่งเมื่อ {request.submittedDate}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium font-sans shadow-sm ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1">{getStatusText(request.status)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 sm:p-6 text-center">
                <div className="mx-auto h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <DocumentTextIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 font-sans">ไม่มีคำขอ</h3>
                <p className="mt-2 text-base text-gray-600 font-sans max-w-md mx-auto">
                  คุณยังไม่ได้ส่งคำขอใดๆ เริ่มต้นโดยสร้างคำขอใบอนุญาตใหม่
                </p>
                <div className="mt-8">
                  <Link
                    href="/eservice/dede/license/new"
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
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
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 font-sans transition-colors duration-200"
              >
                ดูคำขอทั้งหมด
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}