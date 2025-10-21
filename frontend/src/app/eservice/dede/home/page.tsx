'use client'

import { useState, useEffect } from 'react'
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

  // Redirect if not authenticated (check both auth systems)
  useEffect(() => {
    const isLoaded = !isLoading && !isPortalLoading
    const hasAuth = isAuthenticated || isPortalAuth
    
    if (isLoaded && !hasAuth) {
      router.push('/')
      return
    }
  }, [isAuthenticated, isPortalAuth, isLoading, isPortalLoading, router])

  // Redirect admin users to admin portal
  useEffect(() => {
    const isLoaded = !isLoading && !isPortalLoading
    const currentUser = portalUser || user
    const hasAuth = isAuthenticated || isPortalAuth
    
    if (isLoaded && hasAuth && currentUser) {
      const adminRoles = [
        'admin', 'system_admin', 'dede_head_admin', 'dede_staff_admin', 'dede_consult_admin', 'auditor_admin',
        'dede_head', 'dede_staff', 'dede_consult', 'auditor'
      ]
      
      if (adminRoles.includes(currentUser.role)) {
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
        {/* User Dashboard Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">DE</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h1 className="text-xl font-bold text-gray-900">DEDE E-Service</h1>
                  <p className="text-sm text-gray-500">แดชบอร์ดผู้ใช้งาน</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  ยินดีต้อนรับ, <span className="font-medium">{user?.fullName || portalUser?.fullName}</span>
                </div>
                <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl p-8 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-2">ยินดีต้อนรับสู่ระบบบริการอิเล็กทรอนิกส์</h2>
            <p className="text-blue-100 mb-6">จัดการคำขอใบอนุญาตพลังงานทดแทนและอนุรักษ์พลังงานของคุณได้อย่างสะดวก</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">{requests?.length || 0}</div>
                <div className="text-blue-100 text-sm">คำขอทั้งหมด</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">
                  {requests?.filter(r => r.status === 'returned').length || 0}
                </div>
                <div className="text-blue-100 text-sm">รอแก้ไข</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">
                  {requests?.filter(r => r.status === 'approved').length || 0}
                </div>
                <div className="text-blue-100 text-sm">อนุมัติแล้ว</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-5 sm:p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <PlusIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">ดำเนินการเร็ว</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  href="/eservice/dede/license/new"
                  onMouseEnter={() => setHoveredCard('new')}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`relative flex items-center justify-center px-4 py-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-300 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${hoveredCard === 'new' ? 'shadow-md transform -translate-y-1' : ''}`}
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  ขอรับใบอนุญาตใหม่
                  {hoveredCard === 'new' && <ArrowRightIcon className="h-4 w-4 ml-2" />}
                </Link>
                <Link
                  href="/eservice/dede/license/renewal"
                  onMouseEnter={() => setHoveredCard('renewal')}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`relative flex items-center justify-center px-4 py-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-300 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${hoveredCard === 'renewal' ? 'shadow-md transform -translate-y-1' : ''}`}
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  ขอต่ออายุ
                  {hoveredCard === 'renewal' && <ArrowRightIcon className="h-4 w-4 ml-2" />}
                </Link>
                <Link
                  href="/eservice/dede/license/extension"
                  onMouseEnter={() => setHoveredCard('extension')}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`relative flex items-center justify-center px-4 py-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-300 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${hoveredCard === 'extension' ? 'shadow-md transform -translate-y-1' : ''}`}
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  ขอขยายการผลิต
                  {hoveredCard === 'extension' && <ArrowRightIcon className="h-4 w-4 ml-2" />}
                </Link>
                <Link
                  href="/eservice/dede/license/reduction"
                  onMouseEnter={() => setHoveredCard('reduction')}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`relative flex items-center justify-center px-4 py-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-300 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${hoveredCard === 'reduction' ? 'shadow-md transform -translate-y-1' : ''}`}
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  ขอลดการผลิต
                  {hoveredCard === 'reduction' && <ArrowRightIcon className="h-4 w-4 ml-2" />}
                </Link>
              </div>
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