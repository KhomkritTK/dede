'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
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
  PencilIcon,
  EyeIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

interface UnifiedLicenseRequest {
  id: number
  request_number: string
  license_type: string
  status: string
  title: string
  description: string
  request_date: string
  user_id: number
  user: {
    id: number
    username: string
    full_name: string
    email: string
  }
}

export default function UserDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
      return
    }
  }, [isAuthenticated, isLoading, router])

  // Redirect admin users to admin portal
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const adminRoles = [
        'admin', 'system_admin', 'dede_head_admin', 'dede_staff_admin', 'dede_consult_admin', 'auditor_admin',
        'dede_head', 'dede_staff', 'dede_consult', 'auditor'
      ]
      
      if (adminRoles.includes(user.role)) {
        router.push('/admin-portal/dashboard')
        return
      }
    }
  }, [isAuthenticated, isLoading, router, user])

  // Fetch license requests from admin portal services
  const { data: requests, isLoading: requestsLoading, refetch } = useQuery({
    queryKey: ['admin-license-requests'],
    queryFn: async () => {
      const response = await apiClient.get<UnifiedLicenseRequest[]>('/api/v1/admin-portal/services/requests')
      return response.data
    },
    enabled: isAuthenticated,
    // Refetch when window gains focus (when user switches back from admin portal)
    refetchOnWindowFocus: true,
  })

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

  const getLicenseTypeDisplayName = (type: string) => {
    switch (type) {
      case 'new':
        return 'ขอรับใบอนุญาตใหม่'
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

  const getFlowStep = (status: string) => {
    switch (status) {
      case 'new_request':
        return 'รอการตรวจสอบเอกสารเบื้องต้น'
      case 'accepted':
        return 'เอกสารผ่านการตรวจสอบเบื้องต้น'
      case 'assigned':
        return 'มอบหมายให้เจ้าหน้าที่ตรวจสอบ'
      case 'appointment':
        return 'นัดหมายวันเข้าตรวจสอบระบบ'
      case 'inspecting':
        return 'กำลังดำเนินการตรวจสอบระบบ'
      case 'inspection_done':
        return 'ตรวจสอบระบบเสร็จสิ้น'
      case 'document_edit':
        return 'รอการแก้ไขเอกสาร'
      case 'report_approved':
        return 'รายงานผลการตรวจสอบได้รับการอนุมัติ'
      case 'approved':
        return 'อนุมัติใบอนุญาตแล้ว'
      case 'rejected':
      case 'rejected_final':
        return 'คำขอถูกปฏิเสธ'
      case 'returned':
        return 'เอกสารถูกตีกลับเพื่อแก้ไข'
      case 'forwarded':
        return 'ส่งเรื่องให้ DEDE Head พิจารณา'
      default:
        return 'กำลังดำเนินการ'
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

        {/* Document Status Viewer */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover-lift animate-fade-in">
          <div className="px-6 py-5 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center mr-3">
                <DocumentTextIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 font-sans">สถานะเอกสาร (Web Portal)</h3>
            </div>
          </div>
          <div className="overflow-hidden">
            {requestsLoading ? (
              <div className="px-6 py-10 sm:p-6 text-center">
                <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium font-sans">กำลังโหลดข้อมูล...</p>
              </div>
            ) : requests && requests.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {requests.map((request) => (
                  <li key={request.id} className="transform transition-all duration-200 hover:bg-gray-50 hover:scale-[1.01]">
                    <div className="px-6 py-5 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <div className="flex-shrink-0 mr-4 p-2 bg-gray-50 rounded-lg">
                            {getStatusIcon(request.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-blue-600 font-sans">
                                {request.request_number}
                              </p>
                              <div className="flex items-center space-x-2">
                                {request.status === 'returned' && (
                                  <Link
                                    href={`/eservice/dede/requests/${request.id}`}
                                    className="inline-flex items-center px-3 py-1 border border-orange-300 shadow-sm text-xs leading-4 font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                  >
                                    <PencilIcon className="h-3 w-3 mr-1" />
                                    แก้ไขเอกสาร
                                  </Link>
                                )}
                                <Link
                                  href={`/eservice/dede/requests/${request.id}`}
                                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  <EyeIcon className="h-3 w-3 mr-1" />
                                  ดูรายละเอียด
                                </Link>
                              </div>
                            </div>
                            <p className="text-base font-medium text-gray-900 font-sans mt-1">
                              {request.title}
                            </p>
                            <div className="flex items-center mt-2 space-x-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 font-sans">
                                {getLicenseTypeDisplayName(request.license_type)}
                              </span>
                              <span className="text-xs text-gray-500 font-sans flex items-center">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                ส่งเมื่อ {new Date(request.request_date).toLocaleDateString('th-TH')}
                              </span>
                              <span className="text-xs text-gray-500 font-sans">
                                ผู้ยื่น: {request.user.full_name}
                              </span>
                            </div>
                            {request.status === 'returned' && (
                              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                                <div className="flex items-start">
                                  <InformationCircleIcon className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                                  <div className="text-xs text-amber-800">
                                    <p className="font-medium">เอกสารถูกตีกลับเพื่อแก้ไข</p>
                                    <p className="mt-1">กรุณาแก้ไขเอกสารตามที่ระบุและส่งใหม่อีกครั้ง</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <div className="flex items-start">
                                <InformationCircleIcon className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                                <div className="text-xs text-blue-800">
                                  <p className="font-medium">สถานะปัจจุบัน: {getStatusText(request.status)}</p>
                                  <p className="mt-1">เอกสารอยู่ในขั้นตอน: {getFlowStep(request.status)}</p>
                                </div>
                              </div>
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
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 sm:p-6 text-center">
                <div className="mx-auto h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <DocumentTextIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 font-sans">ไม่มีเอกสาร</h3>
                <p className="mt-2 text-base text-gray-600 font-sans max-w-md mx-auto">
                  คุณยังไม่ได้ส่งคำขอใดๆ สำหรับ Web Portal
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
          {requests && requests.length > 0 && (
            <div className="px-6 py-4 sm:px-6 bg-gray-50 text-right">
              <a
                href="/web-portal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 font-sans transition-colors duration-200"
              >
                ดูสถานะใน Web Portal
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </a>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}