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
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
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

  // Filter requests based on search term and status
  const filteredRequests = requests?.filter(request => {
    const matchesSearch = searchTerm === '' ||
      request.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus
    
    return matchesSearch && matchesFilter
  }) || []

  if ((isLoading || !isAuthenticated) && (isPortalLoading || !isPortalAuth)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-t-4 border-transparent animate-pulse"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">กำลังโหลด...</p>
          <p className="mt-2 text-sm text-gray-500">กรุณารอสักครู่</p>
        </div>
      </div>
    )
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 shadow-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  ยินดีต้อนรับ, {portalUser?.fullName || user?.fullName || portalUser?.username || user?.username}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  จัดการคำขอใบอนุญาตพลังงานทดแทนของคุณได้อย่างสะดวกง่าย
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{requests?.length || 0}</div>
                    <div className="text-sm text-blue-100">คำขอที่กำลังดำเนินการ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="relative group">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                สร้างคำขอใบอนุญาตใหม่สำหรับธุรกิจของคุณ
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
              </div>
              <button
                onClick={() => router.push('/eservice/dede/license/new')}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-green-300 group w-full"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    <PlusIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">สร้างคำขอใหม่</div>
                    <div className="text-sm text-gray-500">เริ่มต้นใช้งาน</div>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="relative group">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                ติดตามสถานะคำขอทั้งหมดของคุณ
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
              </div>
              <button
                onClick={() => {
                  const element = document.querySelector('#document-status') as HTMLElement
                  window.scrollTo({ top: element?.offsetTop || 0, behavior: 'smooth' })
                }}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300 group w-full"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">ติดตามสถานะ</div>
                    <div className="text-sm text-gray-500">ดูความคืบหน้า</div>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="relative group">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                ต่ออายุใบอนุญาตที่กำลังจะหมดอายุ
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
              </div>
              <button
                onClick={() => router.push('/eservice/dede/license/renewal')}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-orange-300 group w-full"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                    <ArrowRightIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">ต่ออายุใบอนุญาต</div>
                    <div className="text-sm text-gray-500">ต่ออายุด่วน</div>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="relative group">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                ดูคู่มือและข้อมูลช่วยเหลือเพิ่มเติม
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
              </div>
              <button
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-purple-300 group w-full"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                    <InformationCircleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">ข้อมูลช่วยเหลือ</div>
                    <div className="text-sm text-gray-500">คู่มือการใช้</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

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
                onFocus={() => setHoveredCard('new')}
                onBlur={() => setHoveredCard(null)}
                className={`group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${hoveredCard === 'new' ? 'transform -translate-y-2' : ''}`}
                aria-label="ขอรับใบอนุญาตใหม่ - สำหรับผู้ประกอบการที่ต้องการขอรับใบอนุญาตพลังงานทดแทนครั้งแรก"
              >
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors" aria-hidden="true">
                  <PlusIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ขอรับใบอนุญาตใหม่</h3>
                <p className="text-sm text-gray-600 mb-4">สำหรับผู้ประกอบการที่ต้องการขอรับใบอนุญาตพลังงานทดแทนครั้งแรก</p>
                <div className="flex items-center text-green-600 font-medium text-sm">
                  ดำเนินการ
                  <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
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
          <div id="document-status" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">สถานะเอกสาร</h3>
                    <p className="text-sm text-gray-600">ติดตามความคืบหน้าคำขอของคุณ</p>
                  </div>
                </div>
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  รีเฟรช
                </button>
              </div>
            </div>
            
            {/* Search and Filter Bar */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ค้นหาเลขที่คำขอ, ชื่อเรื่อง, หรือชื่อผู้ยื่น..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="all">ทุกสถานะ</option>
                    <option value="new_request">รอตรวจสอบ</option>
                    <option value="accepted">รับคำขอแล้ว</option>
                    <option value="assigned">มอบหมายแล้ว</option>
                    <option value="appointment">นัดหมาย</option>
                    <option value="inspecting">กำลังตรวจสอบ</option>
                    <option value="inspection_done">ตรวจสอบเสร็จ</option>
                    <option value="document_edit">แก้ไขเอกสาร</option>
                    <option value="report_approved">รับรองรายงาน</option>
                    <option value="approved">อนุมัติแล้ว</option>
                    <option value="returned">ตีกลับ</option>
                    <option value="rejected">ปฏิเสธ</option>
                  </select>
                </div>
              </div>
              {(searchTerm || filterStatus !== 'all') && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    พบ {filteredRequests.length} รายการ {requests && requests.length !== filteredRequests.length && `จากทั้งหมด ${requests.length} รายการ`}
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilterStatus('all')
                    }}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    ล้างตัวกรอง
                  </button>
                </div>
              )}
            </div>
            
          <div className="overflow-hidden">
            {requestsLoading ? (
              <div className="px-6 py-12 sm:p-6 text-center">
                <div className="relative inline-flex justify-center items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                  <div className="absolute inset-0 rounded-full h-12 w-12 border-t-4 border-transparent animate-pulse"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium font-sans">กำลังโหลดข้อมูลเอกสาร...</p>
                <p className="mt-2 text-sm text-gray-500">กำลังดึงข้อมูลล่าสุดจากระบบ</p>
              </div>
            ) : filteredRequests.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {filteredRequests.map((request) => (
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
            ) : searchTerm || filterStatus !== 'all' ? (
              <div className="px-6 py-12 sm:p-6 text-center">
                <div className="mx-auto h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 font-sans">ไม่พบรายการที่ค้นหา</h3>
                <p className="mt-2 text-base text-gray-600 font-sans max-w-md mx-auto">
                  ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองและลองใหม่อีกครั้ง
                </p>
                <div className="mt-8">
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilterStatus('all')
                    }}
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    ล้างตัวกรอง
                  </button>
                </div>
              </div>
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