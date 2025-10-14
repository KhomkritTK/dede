'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { apiClient } from '@/lib/api'
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface LicenseRequestDetail {
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
  // Additional fields for new license requests
  project_address?: string
  province?: string
  district?: string
  subdistrict?: string
  postal_code?: string
  energy_type?: string
  capacity?: number
  capacity_unit?: string
  expected_start_date?: string
  contact_person?: string
  contact_phone?: string
  contact_email?: string
}

export default function AdminServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [showForwardModal, setShowForwardModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [assignRole, setAssignRole] = useState('')
  const [assignReason, setAssignReason] = useState('')
  const [returnReason, setReturnReason] = useState('')
  const [forwardReason, setForwardReason] = useState('')

  // Fetch license request details
  const { data: request, isLoading, error } = useQuery({
    queryKey: ['admin-license-request', id],
    queryFn: async () => {
      // Try to determine the license type from the URL or query params
      const type = new URLSearchParams(window.location.search).get('type') || 'new'
      const response = await apiClient.get<LicenseRequestDetail>(`/api/v1/admin-portal/services/requests/${id}?type=${type}`)
      return response.data
    },
    enabled: !!id,
  })

  // Update request status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { status: string; reason?: string }) => {
      const type = new URLSearchParams(window.location.search).get('type') || 'new'
      const response = await apiClient.put(`/api/v1/admin-portal/services/requests/${id}/status?type=${type}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-license-request', id] })
      alert('สถานะคำขอถูกอัปเดตเรียบร้อย')
    },
    onError: (error) => {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ: ' + error.message)
    }
  })

  // Assign request mutation
  const assignMutation = useMutation({
    mutationFn: async (data: { role: string; reason: string }) => {
      const type = new URLSearchParams(window.location.search).get('type') || 'new'
      const response = await apiClient.post(`/api/v1/admin-portal/services/requests/${id}/assign?type=${type}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-license-request', id] })
      setShowAssignModal(false)
      setAssignRole('')
      setAssignReason('')
      alert('คำขอถูกมอบหมายเรียบร้อย')
    },
    onError: (error) => {
      alert('เกิดข้อผิดพลาดในการมอบหมาย: ' + error.message)
    }
  })

  // Return documents to user mutation
  const returnDocumentsMutation = useMutation({
    mutationFn: async (data: { reason: string }) => {
      const type = new URLSearchParams(window.location.search).get('type') || 'new'
      const response = await apiClient.post(`/api/v1/admin-portal/services/requests/${id}/return?type=${type}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-license-request', id] })
      setShowReturnModal(false)
      setReturnReason('')
      alert('เอกสารถูกส่งกลับไปยังผู้ใช้เรียบร้อย')
    },
    onError: (error) => {
      alert('เกิดข้อผิดพลาดในการส่งเอกสารกลับ: ' + error.message)
    }
  })

  // Forward to DEDE Head mutation
  const forwardToDedeHeadMutation = useMutation({
    mutationFn: async (data: { reason: string }) => {
      const type = new URLSearchParams(window.location.search).get('type') || 'new'
      const response = await apiClient.post(`/api/v1/admin-portal/services/requests/${id}/forward?type=${type}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-license-request', id] })
      setShowForwardModal(false)
      setForwardReason('')
      alert('คำขอถูกส่งต่อให้ DEDE Head เรียบร้อย')
    },
    onError: (error) => {
      alert('เกิดข้อผิดพลาดในการส่งต่อคำขอ: ' + error.message)
    }
  })

  const handleAccept = () => {
    updateStatusMutation.mutate({ status: 'accepted' })
  }

  const handleReject = () => {
    updateStatusMutation.mutate({ status: 'rejected', reason: rejectReason })
    setShowRejectModal(false)
    setRejectReason('')
  }

  const handleAssign = () => {
    assignMutation.mutate({ role: assignRole, reason: assignReason })
  }

  const handleReturnDocuments = () => {
    returnDocumentsMutation.mutate({ reason: returnReason })
  }

  const handleForwardToDedeHead = () => {
    forwardToDedeHeadMutation.mutate({ reason: forwardReason })
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

  const getStatusDisplayName = (status: string) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่พบข้อมูลคำขอ</h3>
            <p className="mt-1 text-sm text-gray-500">
              ไม่สามารถค้นหาข้อมูลคำขอที่ระบุได้
            </p>
            <div className="mt-6">
              <Link
                href="/admin-portal/services"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                กลับไปหน้ารายการคำขอ
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/admin-portal/services"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              กลับไปหน้ารายการคำขอ
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              รายละเอียดคำขอ
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {getStatusDisplayName(request.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Information */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  ข้อมูลคำขอ
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">เลขที่คำขอ</dt>
                    <dd className="mt-1 text-sm text-gray-900">{request.request_number}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">ประเภทคำขอ</dt>
                    <dd className="mt-1 text-sm text-gray-900">{getLicenseTypeDisplayName(request.license_type)}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">ชื่อโครงการ</dt>
                    <dd className="mt-1 text-sm text-gray-900">{request.title}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">รายละเอียด</dt>
                    <dd className="mt-1 text-sm text-gray-900">{request.description}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">วันที่ยื่นคำขอ</dt>
                    <dd className="mt-1 text-sm text-gray-900">{new Date(request.request_date).toLocaleDateString('th-TH')}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Project Information (for new license requests) */}
            {request.license_type === 'new' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    ข้อมูลโครงการ
                  </h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        ที่ตั้งโครงการ
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {request.project_address}, {request.district}, {request.subdistrict}, {request.province} {request.postal_code}
                      </dd>
                    </div>
                    {request.energy_type && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">ประเภทพลังงาน</dt>
                        <dd className="mt-1 text-sm text-gray-900">{request.energy_type}</dd>
                      </div>
                    )}
                    {request.capacity && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">กำลังการผลิต</dt>
                        <dd className="mt-1 text-sm text-gray-900">{request.capacity} {request.capacity_unit}</dd>
                      </div>
                    )}
                    {request.expected_start_date && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          วันที่คาดว่าจะเริ่มผลิต
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{new Date(request.expected_start_date).toLocaleDateString('th-TH')}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  ข้อมูลผู้ยื่นคำขอ
                </h3>
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{request.user.full_name}</p>
                    <p className="text-xs text-gray-500">{request.user.username}</p>
                  </div>
                </div>
                <dl className="space-y-2">
                  <div className="flex items-center text-sm">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-900">{request.user.email}</span>
                  </div>
                  {request.contact_phone && (
                    <div className="flex items-center text-sm">
                      <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-900">{request.contact_phone}</span>
                    </div>
                  )}
                  {request.contact_person && (
                    <div className="text-sm">
                      <span className="text-gray-500">ผู้ติดต่อ:</span>
                      <span className="ml-1 text-gray-900">{request.contact_person}</span>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  จัดการคำขอ
                </h3>
                <div className="space-y-3">
                  {request.status === 'new_request' && (
                    <>
                      <button
                        type="button"
                        onClick={handleAccept}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        รับคำขอ
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRejectModal(true)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XCircleIcon className="h-4 w-4 mr-2" />
                        ปฏิเสธคำขอ
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAssignModal(true)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <UserGroupIcon className="h-4 w-4 mr-2" />
                        มอบหมาย
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReturnModal(true)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        ตีเอกสารกลับไปแก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForwardModal(true)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                      >
                        <UserGroupIcon className="h-4 w-4 mr-2" />
                        ส่งต่อให้ DEDE Head
                      </button>
                    </>
                  )}
                  
                  {request.status === 'accepted' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowAssignModal(true)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <UserGroupIcon className="h-4 w-4 mr-2" />
                        มอบหมาย
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReturnModal(true)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        ตีเอกสารกลับไปแก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForwardModal(true)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                      >
                        <UserGroupIcon className="h-4 w-4 mr-2" />
                        ส่งต่อให้ DEDE Head
                      </button>
                    </>
                  )}
                  
                  <button
                    type="button"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    ดูประวัติการดำเนินการ
                  </button>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    ดาวน์โหลดเอกสาร
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">ปฏิเสธคำขอ</h3>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เหตุผลในการปฏิเสธ
              </label>
              <textarea
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="กรุณาระบุเหตุผลในการปฏิเสธคำขอ"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <UserGroupIcon className="h-6 w-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">มอบหมายคำขอ</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  มอบหมายให้
                </label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                >
                  <option value="">เลือกบทบาท</option>
                  <option value="inspector">ผู้ตรวจสอบ</option>
                  <option value="supervisor">ผู้ประสานงาน</option>
                  <option value="manager">ผู้จัดการ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เหตุผลในการมอบหมาย
                </label>
                <textarea
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={assignReason}
                  onChange={(e) => setAssignReason(e.target.value)}
                  placeholder="กรุณาระบุเหตุผลในการมอบหมาย"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAssignModal(false)
                  setAssignRole('')
                  setAssignReason('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleAssign}
                disabled={!assignRole.trim() || !assignReason.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                ยืนยันการมอบหมาย
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Documents Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <ArrowLeftIcon className="h-6 w-6 text-amber-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">ตีเอกสารกลับไปแก้ไข</h3>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เหตุผลในการตีเอกสารกลับ
              </label>
              <textarea
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="กรุณาระบุเหตุผลในการตีเอกสารกลับไปแก้ไข"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowReturnModal(false)
                  setReturnReason('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleReturnDocuments}
                disabled={!returnReason.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
              >
                ยืนยันการตีเอกสารกลับ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward to DEDE Head Modal */}
      {showForwardModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <UserGroupIcon className="h-6 w-6 text-cyan-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">ส่งต่อให้ DEDE Head</h3>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เหตุผลในการส่งต่อ
              </label>
              <textarea
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={forwardReason}
                onChange={(e) => setForwardReason(e.target.value)}
                placeholder="กรุณาระบุเหตุผลในการส่งต่อให้ DEDE Head"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForwardModal(false)
                  setForwardReason('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleForwardToDedeHead}
                disabled={!forwardReason.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
              >
                ยืนยันการส่งต่อ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}