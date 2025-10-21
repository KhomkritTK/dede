'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { usePortalAuth } from '@/hooks/usePortalAuth'
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
  const { user: portalUser, isAuthenticated: isPortalAuth, isLoading: isPortalLoading } = usePortalAuth()
  const router = useRouter()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const hasRedirected = useRef(false)

  // Redirect if not authenticated (check both auth systems)
  useEffect(() => {
    if (hasRedirected.current) return
    
    const isLoaded = !isLoading && !isPortalLoading
    const hasAuth = isAuthenticated || isPortalAuth
    
    if (isLoaded && !hasAuth) {
      hasRedirected.current = true
      router.push('/')
      return
    }
  }, [isAuthenticated, isPortalAuth, isLoading, isPortalLoading, router])

  // Redirect admin users to admin portal
  useEffect(() => {
    if (hasRedirected.current) return
    
    const isLoaded = !isLoading && !isPortalLoading
    const currentUser = portalUser || user
    const hasAuth = isAuthenticated || isPortalAuth
    
    if (isLoaded && hasAuth && currentUser) {
      const adminRoles = [
        'admin', 'system_admin', 'dede_head_admin', 'dede_staff_admin', 'dede_consult_admin', 'auditor_admin',
        'dede_head', 'dede_staff', 'dede_consult', 'auditor'
      ]
      
      if (adminRoles.includes(currentUser.role)) {
        hasRedirected.current = true
        router.push('/admin-portal/dashboard')
        return
      }
    }
  }, [isAuthenticated, isPortalAuth, isLoading, isPortalLoading, router, user, portalUser])

  // Fetch license requests from admin portal services
  const { data: requests, isLoading: requestsLoading, refetch } = useQuery({
    queryKey: ['admin-license-requests'],
    queryFn: async () => {
      const response = await apiClient.get<UnifiedLicenseRequest[]>('/api/v1/admin-portal/services/requests')
      return response.data
    },
    enabled: isAuthenticated || isPortalAuth,
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
        return 'เอกสารถูกส่งให้ DEDE Admin'
      case 'accepted':
        return 'DEDE Admin รับคำขอแล้ว'
      case 'assigned':
        return 'มอบหมายให้เจ้าหน้าที่ตรวจสอบ'
      case 'appointment':
        return 'นัดหมายวันเข้าตรวจสอบ'
      case 'inspecting':
        return 'กำลังดำเนินการตรวจสอบ'
      case 'inspection_done':
        return 'ตรวจสอบเสร็จสิ้น'
      case 'document_edit':
        return 'แก้ไขเอกสาร'
      case 'report_approved':
        return 'รับรองรายงาน'
      case 'approved':
        return 'อนุมัติใบอนุญาตแล้ว'
      case 'rejected':
        return 'ปฏิเสธคำขอ'
      case 'rejected_final':
        return 'ปฏิเสธสุดท้าย'
      case 'returned':
        return 'เอกสารถูกตีกลับเพื่อแก้ไข'
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

  if ((isLoading || !isAuthenticated) && (isPortalLoading || !isPortalAuth)) {
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
      <div className="min-h-screen bg-gray-50">
        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Services Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 mb-8 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">บริการใบอนุญาตพลังงานทดแทน</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน ให้บริการด้านใบอนุญาตพลังงานทดแทนและอนุรักษ์พลังงาน
                เพื่อสนับสนุนการพัฒนาและใช้ประโยชน์จากพลังงานทดแทนอย่างยั่งยืน
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                href="/eservice/dede/license/new"
                onMouseEnter={() => setHoveredCard('new')}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 ${hoveredCard === 'new' ? 'transform -translate-y-2' : ''}`}
              >
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                  <PlusIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ขอรับใบอนุญาตใหม่</h3>
                <p className="text-sm text-gray-600 mb-4">สำหรับผู้ประกอบการที่ต้องการขอรับใบอนุญาตพลังงานทดแทนครั้งแรก</p>
                <div className="flex items-center text-green-600 font-medium text-sm">
                  ดำเนินการ
                  <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link
                href="/eservice/dede/license/renewal"
                onMouseEnter={() => setHoveredCard('renewal')}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 ${hoveredCard === 'renewal' ? 'transform -translate-y-2' : ''}`}
              >
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <PlusIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ขอต่ออายุใบอนุญาต</h3>
                <p className="text-sm text-gray-600 mb-4">สำหรับต่ออายุใบอนุญาตที่กำลังจะหมดอายุ</p>
                <div className="flex items-center text-blue-600 font-medium text-sm">
                  ดำเนินการ
                  <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link
                href="/eservice/dede/license/extension"
                onMouseEnter={() => setHoveredCard('extension')}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 ${hoveredCard === 'extension' ? 'transform -translate-y-2' : ''}`}
              >
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                  <PlusIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ขอขยายการผลิต</h3>
                <p className="text-sm text-gray-600 mb-4">สำหรับขอขยายกำลังการผลิตพลังงานทดแทน</p>
                <div className="flex items-center text-purple-600 font-medium text-sm">
                  ดำเนินการ
                  <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link
                href="/eservice/dede/license/reduction"
                onMouseEnter={() => setHoveredCard('reduction')}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 ${hoveredCard === 'reduction' ? 'transform -translate-y-2' : ''}`}
              >
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600 transition-colors">
                  <PlusIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ขอลดการผลิต</h3>
                <p className="text-sm text-gray-600 mb-4">สำหรับขอลดกำลังการผลิตพลังงานทดแทน</p>
                <div className="flex items-center text-orange-600 font-medium text-sm">
                  ดำเนินการ
                  <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* Document Status Viewer */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 sm:p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <DocumentTextIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">สถานะเอกสาร</h3>
              </div>
            </div>
          <div className="overflow-hidden">
            {requestsLoading ? (
              <div className="px-6 py-12 sm:p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium font-sans">กำลังโหลดข้อมูลเอกสาร...</p>
              </div>
            ) : requests && requests.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {requests.map((request) => (
                  <li key={request.id} className="transform transition-all duration-200 hover:bg-blue-50 hover:shadow-md">
                    <div className="px-6 py-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start flex-1">
                          <div className="flex-shrink-0 mr-4 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm">
                            {getStatusIcon(request.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-sm font-bold text-blue-600 font-sans">
                                  📄 {request.request_number}
                                </p>
                                <p className="text-lg font-semibold text-gray-900 font-sans mt-1">
                                  {request.title}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                {request.status === 'returned' && (
                                  <Link
                                    href={`/eservice/dede/requests/${request.id}?type=${request.license_type}`}
                                    className="inline-flex items-center px-3 py-2 border border-orange-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                                  >
                                    <PencilIcon className="h-4 w-4 mr-1" />
                                    แก้ไขเอกสาร
                                  </Link>
                                )}
                                <Link
                                  href={`/eservice/dede/requests/${request.id}?type=${request.license_type}`}
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                  <EyeIcon className="h-4 w-4 mr-1" />
                                  ดูรายละเอียด
                                </Link>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 font-sans">
                                📋 {getLicenseTypeDisplayName(request.license_type)}
                              </span>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 font-sans">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                ส่งเมื่อ {new Date(request.request_date).toLocaleDateString('th-TH')}
                              </span>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 font-sans">
                                👤 {request.user.full_name}
                              </span>
                            </div>
                            
                            {request.status === 'returned' && (
                              <div className="mb-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                                <div className="flex items-start">
                                  <div className="flex-shrink-0">
                                    <span className="text-amber-600 text-lg">⚠️</span>
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-amber-800">📝 เอกสารถูกตีกลับเพื่อแก้ไข</p>
                                    <p className="text-xs text-amber-700 mt-1">กรุณาแก้ไขเอกสารตามที่ระบุและส่งใหม่อีกครั้ง</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  <span className="text-blue-600 text-lg">ℹ️</span>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-blue-900">
                                    เอกสาร <span className="font-bold">{request.request_number}</span> {getStatusText(request.status)}
                                  </p>
                                  <p className="text-xs text-blue-700 mt-1">
                                    📍 ขั้นตอนถัดไป: {getFlowStep(request.status)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium font-sans shadow-sm ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-2">{getStatusText(request.status)}</span>
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
          {/* No footer link needed */}
        </div>
      </main>
      </div>
    </PublicLayout>
  )
}