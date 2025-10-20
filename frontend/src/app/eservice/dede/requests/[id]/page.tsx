'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { usePortalAuth } from '@/hooks/usePortalAuth'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import PublicLayout from '@/components/layout/PublicLayout'
import Link from 'next/link'
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'

interface RequestDetail {
  id: string
  requestNumber: string
  type: 'new_license' | 'renewal' | 'extension' | 'reduction'
  title: string
  description: string
  status: 'new_request' | 'accepted' | 'assigned' | 'appointment' | 'inspecting' | 'inspection_done' | 'document_edit' | 'report_approved' | 'approved' | 'rejected' | 'rejected_final' | 'returned' | 'forwarded'
  submittedDate: string
  lastUpdated: string
  // Additional fields for new license requests
  projectAddress?: string
  province?: string
  district?: string
  subdistrict?: string
  postalCode?: string
  energyType?: string
  capacity?: number
  capacityUnit?: string
  expectedStartDate?: string
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  // Status history
  statusHistory?: {
    date: string
    status: string
    description: string
    officer?: string
  }[]
  // Documents
  documents?: {
    id: string
    name: string
    type: string
    uploadDate: string
    size: string
    status: 'pending' | 'approved' | 'rejected' | 'needs_revision'
  }[]
}

export default function RequestDetailPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { user: portalUser, isAuthenticated: isPortalAuth, isLoading: isPortalLoading } = usePortalAuth()
  const params = useParams()
  const router = useRouter()
  
  // Get the current authenticated user from either auth system
  const currentUser = portalUser || user
  const isUserAuthenticated = isAuthenticated || isPortalAuth

  // Fetch request details
  const { data: request, isLoading: requestLoading } = useQuery({
    queryKey: ['request-detail', params.id],
    queryFn: async () => {
      const response = await apiClient.get<RequestDetail>(`/api/v1/admin-portal/services/requests/${params.id}`)
      return response.data
    },
    enabled: isUserAuthenticated && !!params.id,
  })

  // Redirect if not authenticated
  useEffect(() => {
    const isLoaded = !isLoading && !isPortalLoading
    const hasAuth = isAuthenticated || isPortalAuth
    
    if (isLoaded && !hasAuth) {
      router.push('/?redirect=eservice/dede/requests/' + params.id)
      return
    }
  }, [isAuthenticated, isPortalAuth, isLoading, isPortalLoading, router, params.id])

  // Redirect admin users to admin portal
  useEffect(() => {
    const isLoaded = !isLoading && !isPortalLoading
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
  }, [isAuthenticated, isPortalAuth, isLoading, isPortalLoading, router, currentUser])

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

  const getTypeText = (type: string) => {
    switch (type) {
      case 'new_license':
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

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'needs_revision':
        return 'bg-amber-100 text-amber-800'
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDocumentStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'อนุมัติ'
      case 'rejected':
        return 'ปฏิเสธ'
      case 'needs_revision':
        return 'ต้องแก้ไข'
      case 'pending':
      default:
        return 'รอดำเนินการ'
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

  if (requestLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">กำลังโหลดข้อมูลคำขอ...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">ไม่พบข้อมูลคำขอ</h3>
            <p className="mt-2 text-gray-600">ไม่สามารถค้นหาข้อมูลคำขอที่ระบุได้</p>
            <div className="mt-6">
              <Link
                href="/eservice/dede/home"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                กลับไปหน้าแดชบอร์ด
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center mb-4">
            <Link
              href="/eservice/dede/home"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mr-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              กลับไปหน้าแดชบอร์ด
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-sans">รายละเอียดคำขอ</h1>
              <p className="mt-1 text-lg text-gray-600 font-sans">{request.requestNumber}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                <span className="ml-1">{getStatusText(request.status)}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Information */}
            <div className="bg-white shadow-xl rounded-xl overflow-hidden hover-lift animate-fade-in">
              <div className="px-6 py-5 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-semibold text-gray-900 font-sans">ข้อมูลคำขอ</h3>
              </div>
              <div className="px-6 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">ชื่อโครงการ</dt>
                    <dd className="mt-1 text-base text-gray-900">{request.title}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">ประเภทคำขอ</dt>
                    <dd className="mt-1 text-base text-gray-900">{getTypeText(request.type)}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">วันที่ยื่นคำขอ</dt>
                    <dd className="mt-1 text-base text-gray-900">{request.submittedDate}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">รายละเอียด</dt>
                    <dd className="mt-1 text-base text-gray-900">{request.description}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Project Information (for new license requests) */}
            {request.type === 'new_license' && (
              <div className="bg-white shadow-xl rounded-xl overflow-hidden hover-lift animate-fade-in">
                <div className="px-6 py-5 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="text-lg font-semibold text-gray-900 font-sans">ข้อมูลโครงการ</h3>
                </div>
                <div className="px-6 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        ที่ตั้งโครงการ
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {request.projectAddress}, {request.district}, {request.subdistrict}, {request.province} {request.postalCode}
                      </dd>
                    </div>
                    {request.energyType && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">ประเภทพลังงาน</dt>
                        <dd className="mt-1 text-base text-gray-900">{request.energyType}</dd>
                      </div>
                    )}
                    {request.capacity && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">กำลังการผลิต</dt>
                        <dd className="mt-1 text-base text-gray-900">{request.capacity} {request.capacityUnit}</dd>
                      </div>
                    )}
                    {request.expectedStartDate && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          วันที่คาดว่าจะเริ่มผลิต
                        </dt>
                        <dd className="mt-1 text-base text-gray-900">{request.expectedStartDate}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}

            {/* Documents */}
            <div className="bg-white shadow-xl rounded-xl overflow-hidden hover-lift animate-fade-in">
              <div className="px-6 py-5 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-semibold text-gray-900 font-sans">เอกสารที่เกี่ยวข้อง</h3>
              </div>
              <div className="px-6 py-5 sm:p-6">
                <div className="space-y-4">
                  {request.documents?.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-base font-medium text-gray-900">{doc.name}</p>
                          <div className="flex items-center mt-1 space-x-4">
                            <span className="text-sm text-gray-500">{doc.type}</span>
                            <span className="text-sm text-gray-500">{doc.size}</span>
                            <span className="text-sm text-gray-500">อัปโหลดเมื่อ {doc.uploadDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDocumentStatusColor(doc.status)}`}>
                          {getDocumentStatusText(doc.status)}
                        </span>
                        <button className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white shadow-xl rounded-xl overflow-hidden hover-lift animate-fade-in">
              <div className="px-6 py-5 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-semibold text-gray-900 font-sans">ข้อมูลติดต่อ</h3>
              </div>
              <div className="px-6 py-5 sm:p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-900">{request.contactPerson || user?.username}</p>
                    <p className="text-sm text-gray-500">ผู้ยื่นคำขอ</p>
                  </div>
                </div>
                <dl className="space-y-3">
                  {request.contactEmail && (
                    <div className="flex items-center text-sm">
                      <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-900">{request.contactEmail}</span>
                    </div>
                  )}
                  {request.contactPhone && (
                    <div className="flex items-center text-sm">
                      <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-900">{request.contactPhone}</span>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Status History */}
            <div className="bg-white shadow-xl rounded-xl overflow-hidden hover-lift animate-fade-in">
              <div className="px-6 py-5 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-semibold text-gray-900 font-sans">ประวัติสถานะ</h3>
              </div>
              <div className="px-6 py-5 sm:p-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {request.statusHistory?.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <div className="relative pb-8">
                          {itemIdx !== request.statusHistory!.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getStatusColor(item.status)}`}>
                                {getStatusIcon(item.status)}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-900">{item.description}</p>
                                <p className="mt-0.5 text-xs text-gray-500">โดย {item.officer}</p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <time dateTime={item.date}>{item.date}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}