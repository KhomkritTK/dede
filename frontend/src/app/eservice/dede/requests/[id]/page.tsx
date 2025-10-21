'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { usePortalAuth } from '@/hooks/usePortalAuth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  PencilIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

interface RequestDetail {
  id: string
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
  status_history?: {
    date: string
    status: string
    description: string
    officer: string
  }[]
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
  // Documents
  documents?: {
    id: string
    name: string
    type: string
    uploadDate: string
    size: string
    status: 'pending' | 'approved' | 'rejected' | 'needs_revision'
  }[]
  // Additional fields for renewal license requests
  license_number?: string
  current_capacity?: number
  current_capacity_unit?: string
  requested_capacity?: number
  requested_capacity_unit?: string
  expiry_date?: string
  requested_expiry_date?: string
  reason?: string
  // Additional fields for extension license requests
  extension_reason?: string
  // Additional fields for reduction license requests
  reduction_reason?: string
}

export default function RequestDetailPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { user: portalUser, isAuthenticated: isPortalAuth, isLoading: isPortalLoading } = usePortalAuth()
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  
  // Get the current authenticated user from either auth system
  const currentUser = portalUser || user
  const isUserAuthenticated = isAuthenticated || isPortalAuth
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>({
    // Common fields
    title: '',
    description: '',
    projectAddress: '',
    province: '',
    district: '',
    subdistrict: '',
    postalCode: '',
    energyType: '',
    capacity: '',
    capacityUnit: '',
    expectedStartDate: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    // Renewal specific fields
    licenseNumber: '',
    currentCapacity: '',
    currentCapacityUnit: '',
    requestedCapacity: '',
    requestedCapacityUnit: '',
    expiryDate: '',
    requestedExpiryDate: '',
    reason: '',
    // Extension specific fields
    extensionReason: '',
    // Reduction specific fields
    reductionReason: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  // Get license type from URL params
  const licenseType = searchParams.get('type') || 'new'

  // Fetch request details
  const { data: request, isLoading: requestLoading } = useQuery({
    queryKey: ['request-detail', params.id, licenseType],
    queryFn: async () => {
      const response = await apiClient.get<RequestDetail>(`/api/v1/admin-portal/services/requests/${params.id}?type=${licenseType}`)
      return response.data
    },
    enabled: isUserAuthenticated && !!params.id,
  })

  // Initialize edit form when request data is loaded
  useEffect(() => {
    if (request && !isEditing) {
      // Get all the relevant data from the request based on license type
      const formData: any = {
        title: request.title,
        description: request.description,
        projectAddress: request.projectAddress,
        province: request.province,
        district: request.district,
        subdistrict: request.subdistrict,
        postalCode: request.postalCode,
        energyType: request.energyType,
        capacity: request.capacity,
        capacityUnit: request.capacityUnit,
        expectedStartDate: request.expectedStartDate,
        contactPerson: request.contactPerson,
        contactPhone: request.contactPhone,
        contactEmail: request.contactEmail,
      }
      
      // Add license type specific fields
      if (request.license_type === 'renewal') {
        // For renewal requests, add renewal specific fields
        formData.licenseNumber = request.license_number
        formData.currentCapacity = request.current_capacity
        formData.currentCapacityUnit = request.current_capacity_unit
        formData.requestedCapacity = request.requested_capacity
        formData.requestedCapacityUnit = request.requested_capacity_unit
        formData.expiryDate = request.expiry_date
        formData.requestedExpiryDate = request.requested_expiry_date
        formData.reason = request.reason
      } else if (request.license_type === 'extension') {
        // For extension requests, add extension specific fields
        formData.licenseNumber = request.license_number
        formData.currentCapacity = request.current_capacity
        formData.currentCapacityUnit = request.current_capacity_unit
        formData.requestedCapacity = request.requested_capacity
        formData.requestedCapacityUnit = request.requested_capacity_unit
        formData.extensionReason = request.extension_reason
      } else if (request.license_type === 'reduction') {
        // For reduction requests, add reduction specific fields
        formData.licenseNumber = request.license_number
        formData.currentCapacity = request.current_capacity
        formData.currentCapacityUnit = request.current_capacity_unit
        formData.requestedCapacity = request.requested_capacity
        formData.requestedCapacityUnit = request.requested_capacity_unit
        formData.reductionReason = request.reduction_reason
      }
      
      setEditForm(formData)
    }
  }, [request, isEditing])

  // Mutation for updating request
  const updateRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.put(`/api/v1/admin-portal/services/requests/${params.id}?type=${licenseType}`, data)
      return response.data
    },
    onSuccess: () => {
      setIsSubmitting(false)
      setIsEditing(false)
      setSubmitMessage('เอกสารได้รับการแก้ไขและส่งเรียบร้อยแล้ว')
      // Refetch request details
      queryClient.invalidateQueries({ queryKey: ['request-detail', params.id, licenseType] })
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitMessage(null), 3000)
    },
    onError: (error: any) => {
      setIsSubmitting(false)
      setSubmitMessage(error.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขเอกสาร')
      // Clear error message after 5 seconds
      setTimeout(() => setSubmitMessage(null), 5000)
    }
  })

  // Handle form submission
  const handleUpdateRequest = () => {
    setIsSubmitting(true)
    setSubmitMessage(null)
    updateRequestMutation.mutate(editForm)
  }

  // Handle canceling edit mode
  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset form to original values
    if (request) {
      const resetForm: any = {
        title: request.title,
        description: request.description,
        projectAddress: request.projectAddress,
        province: request.province,
        district: request.district,
        subdistrict: request.subdistrict,
        postalCode: request.postalCode,
        energyType: request.energyType,
        capacity: request.capacity,
        capacityUnit: request.capacityUnit,
        expectedStartDate: request.expectedStartDate,
        contactPerson: request.contactPerson,
        contactPhone: request.contactPhone,
        contactEmail: request.contactEmail,
      }
      
      // Add license type specific fields
      if (request.license_type === 'renewal') {
        resetForm.licenseNumber = request.license_number
        resetForm.currentCapacity = request.current_capacity
        resetForm.currentCapacityUnit = request.current_capacity_unit
        resetForm.requestedCapacity = request.requested_capacity
        resetForm.requestedCapacityUnit = request.requested_capacity_unit
        resetForm.expiryDate = request.expiry_date
        resetForm.requestedExpiryDate = request.requested_expiry_date
        resetForm.reason = request.reason
      } else if (request.license_type === 'extension') {
        resetForm.licenseNumber = request.license_number
        resetForm.currentCapacity = request.current_capacity
        resetForm.currentCapacityUnit = request.current_capacity_unit
        resetForm.requestedCapacity = request.requested_capacity
        resetForm.requestedCapacityUnit = request.requested_capacity_unit
        resetForm.extensionReason = request.extension_reason
      } else if (request.license_type === 'reduction') {
        resetForm.licenseNumber = request.license_number
        resetForm.currentCapacity = request.current_capacity
        resetForm.currentCapacityUnit = request.current_capacity_unit
        resetForm.requestedCapacity = request.requested_capacity
        resetForm.requestedCapacityUnit = request.requested_capacity_unit
        resetForm.reductionReason = request.reduction_reason
      }
      
      setEditForm(resetForm)
    }
  }

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
      case 'request_submitted':
        return <ClockIcon className="h-5 w-5 text-blue-500" />
      case 'accepted':
      case 'request_accepted':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'assigned':
      case 'request_assigned':
        return <ClipboardDocumentCheckIcon className="h-5 w-5 text-purple-500" />
      case 'appointment':
      case 'appointment_set':
        return <CalendarIcon className="h-5 w-5 text-yellow-500" />
      case 'inspecting':
        return <ClipboardDocumentCheckIcon className="h-5 w-5 text-orange-500" />
      case 'inspection_done':
      case 'inspection_completed':
        return <CheckCircleIcon className="h-5 w-5 text-teal-500" />
      case 'document_edit':
        return <ClipboardDocumentCheckIcon className="h-5 w-5 text-indigo-500" />
      case 'report_approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'report_submitted':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'rejected':
      case 'rejected_final':
      case 'request_rejected':
      case 'report_rejected':
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
      case 'request_submitted':
        return 'bg-blue-100 text-blue-800'
      case 'accepted':
      case 'request_accepted':
        return 'bg-green-100 text-green-800'
      case 'assigned':
      case 'request_assigned':
        return 'bg-purple-100 text-purple-800'
      case 'appointment':
      case 'appointment_set':
        return 'bg-yellow-100 text-yellow-800'
      case 'inspecting':
        return 'bg-orange-100 text-orange-800'
      case 'inspection_done':
      case 'inspection_completed':
        return 'bg-teal-100 text-teal-800'
      case 'document_edit':
        return 'bg-indigo-100 text-indigo-800'
      case 'report_approved':
        return 'bg-green-100 text-green-800'
      case 'report_submitted':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
      case 'rejected_final':
      case 'request_rejected':
      case 'report_rejected':
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
              <h1 className="text-3xl font-bold text-gray-900 font-sans">
                {isEditing ? 'แก้ไขคำขอ' : 'รายละเอียดคำขอ'}
              </h1>
              <p className="mt-1 text-lg text-gray-600 font-sans">{request.request_number}</p>
            </div>
            <div className="flex items-center space-x-2">
              {request.status === 'returned' && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-orange-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  แก้ไขเอกสาร
                </button>
              )}
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 disabled:opacity-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleUpdateRequest}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                        กำลังส่ง...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-1" />
                        ส่งเอกสาร
                      </>
                    )}
                  </button>
                </div>
              )}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                <span className="ml-1">{getStatusText(request.status)}</span>
              </span>
            </div>
          </div>

          {/* Success/Error Message */}
          {submitMessage && (
            <div className={`mt-4 rounded-lg p-4 ${submitMessage.includes('เรียบร้อย') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {submitMessage.includes('เรียบร้อย') ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${submitMessage.includes('เรียบร้อย') ? 'text-green-800' : 'text-red-800'}`}>
                    {submitMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
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
                    <dd className="mt-1 text-base text-gray-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      ) : (
                        request.title
                      )}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">ประเภทคำขอ</dt>
                    <dd className="mt-1 text-base text-gray-900">{getTypeText(request.license_type)}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">วันที่ยื่นคำขอ</dt>
                    <dd className="mt-1 text-base text-gray-900">{new Date(request.request_date).toLocaleDateString('th-TH')}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">รายละเอียด</dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {isEditing ? (
                        <textarea
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          rows={4}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      ) : (
                        request.description
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Project Information (for new license requests) */}
            {request.license_type === 'new' && (
              <div className="bg-white shadow-xl rounded-xl overflow-hidden hover-lift animate-fade-in">
                <div className="px-6 py-5 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="text-lg font-semibold text-gray-900 font-sans">ข้อมูลโครงการ</h3>
                </div>
                <div className="px-6 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        ที่อยู่โครงการ
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.projectAddress || ''}
                            onChange={(e) => setEditForm({ ...editForm, projectAddress: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
                          />
                        ) : (
                          request.projectAddress
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">จังหวัด</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.province || ''}
                            onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          request.province
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">อำเภอ/เขต</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.district || ''}
                            onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          request.district
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">ตำบล/แขวง</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.subdistrict || ''}
                            onChange={(e) => setEditForm({ ...editForm, subdistrict: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          request.subdistrict
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">รหัสไปรษณีย์</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.postalCode || ''}
                            onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          request.postalCode
                        )}
                      </dd>
                    </div>
                    {request.energyType && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">ประเภทพลังงาน</dt>
                        <dd className="mt-1 text-base text-gray-900">
                          {isEditing ? (
                            <select
                              value={editForm.energyType || ''}
                              onChange={(e) => setEditForm({ ...editForm, energyType: e.target.value })}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="">เลือกประเภทพลังงาน</option>
                              <option value="solar">พลังงานแสงอาทิตย์</option>
                              <option value="wind">พลังงานลม</option>
                              <option value="biomass">พลังงานชีวมวล</option>
                              <option value="hydro">พลังงานน้ำ</option>
                              <option value="waste">พลังงานขยะมูลฝอย</option>
                            </select>
                          ) : (
                            request.energyType
                          )}
                        </dd>
                      </div>
                    )}
                    {request.capacity && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">กำลังการผลิต</dt>
                        <dd className="mt-1 text-base text-gray-900">
                          {isEditing ? (
                            <div className="flex items-center">
                              <input
                                type="text"
                                value={editForm.capacity || ''}
                                onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-r-none"
                              />
                              <select
                                value={editForm.capacityUnit || ''}
                                onChange={(e) => setEditForm({ ...editForm, capacityUnit: e.target.value })}
                                className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="MW">MW</option>
                                <option value="kW">kW</option>
                                <option value="MWp">MWp</option>
                                <option value="kWp">kWp</option>
                              </select>
                            </div>
                          ) : (
                            `${request.capacity} ${request.capacityUnit}`
                          )}
                        </dd>
                      </div>
                    )}
                    {request.expectedStartDate && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          วันที่คาดว่าจะเริ่มผลิต
                        </dt>
                        <dd className="mt-1 text-base text-gray-900">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editForm.expectedStartDate || ''}
                              onChange={(e) => setEditForm({ ...editForm, expectedStartDate: e.target.value })}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          ) : (
                            request.expectedStartDate
                          )}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}

            {/* Renewal License Information */}
            {request.license_type === 'renewal' && (
              <div className="bg-white shadow-xl rounded-xl overflow-hidden hover-lift animate-fade-in">
                <div className="px-6 py-5 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="text-lg font-semibold text-gray-900 font-sans">ข้อมูลต่ออายุใบอนุญาต</h3>
                </div>
                <div className="px-6 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">เลขที่ใบอนุญาต</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.licenseNumber || ''}
                            onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          request.license_number
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">วันหมดอายุปัจจุบัน</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editForm.expiryDate || ''}
                            onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          request.expiry_date
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">วันที่ขอต่ออายุ</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editForm.requestedExpiryDate || ''}
                            onChange={(e) => setEditForm({ ...editForm, requestedExpiryDate: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          request.requested_expiry_date
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">กำลังการผลิตปัจจุบัน</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={editForm.currentCapacity || ''}
                              onChange={(e) => setEditForm({ ...editForm, currentCapacity: e.target.value })}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-r-none"
                            />
                            <select
                              value={editForm.currentCapacityUnit || ''}
                              onChange={(e) => setEditForm({ ...editForm, currentCapacityUnit: e.target.value })}
                              className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="MW">MW</option>
                              <option value="kW">kW</option>
                            </select>
                          </div>
                        ) : (
                          `${request.current_capacity} ${request.current_capacity_unit}`
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">กำลังการผลิตที่ขอ</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={editForm.requestedCapacity || ''}
                              onChange={(e) => setEditForm({ ...editForm, requestedCapacity: e.target.value })}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-r-none"
                            />
                            <select
                              value={editForm.requestedCapacityUnit || ''}
                              onChange={(e) => setEditForm({ ...editForm, requestedCapacityUnit: e.target.value })}
                              className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="MW">MW</option>
                              <option value="kW">kW</option>
                            </select>
                          </div>
                        ) : (
                          `${request.requested_capacity} ${request.requested_capacity_unit}`
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">เหตุผลที่ขอต่ออายุ</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <textarea
                            value={editForm.reason || ''}
                            onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                            rows={4}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          request.reason
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {/* Extension License Information */}
            {request.license_type === 'extension' && (
              <div className="bg-white shadow-xl rounded-xl overflow-hidden hover-lift animate-fade-in">
                <div className="px-6 py-5 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="text-lg font-semibold text-gray-900 font-sans">ข้อมูลขยายการผลิต</h3>
                </div>
                <div className="px-6 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">เลขที่ใบอนุญาต</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.licenseNumber || ''}
                            onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          request.license_number
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">กำลังการผลิตปัจจุบัน</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={editForm.currentCapacity || ''}
                              onChange={(e) => setEditForm({ ...editForm, currentCapacity: e.target.value })}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-r-none"
                            />
                            <select
                              value={editForm.currentCapacityUnit || ''}
                              onChange={(e) => setEditForm({ ...editForm, currentCapacityUnit: e.target.value })}
                              className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="MW">MW</option>
                              <option value="kW">kW</option>
                            </select>
                          </div>
                        ) : (
                          `${request.current_capacity} ${request.current_capacity_unit}`
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">กำลังการผลิตที่ขอ</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={editForm.requestedCapacity || ''}
                              onChange={(e) => setEditForm({ ...editForm, requestedCapacity: e.target.value })}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-r-none"
                            />
                            <select
                              value={editForm.requestedCapacityUnit || ''}
                              onChange={(e) => setEditForm({ ...editForm, requestedCapacityUnit: e.target.value })}
                              className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="MW">MW</option>
                              <option value="kW">kW</option>
                            </select>
                          </div>
                        ) : (
                          `${request.requested_capacity} ${request.requested_capacity_unit}`
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">เหตุผลที่ขอขยายการผลิต</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <textarea
                            value={editForm.extensionReason || ''}
                            onChange={(e) => setEditForm({ ...editForm, extensionReason: e.target.value })}
                            rows={4}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          request.extension_reason
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {/* Reduction License Information */}
            {request.license_type === 'reduction' && (
              <div className="bg-white shadow-xl rounded-xl overflow-hidden hover-lift animate-fade-in">
                <div className="px-6 py-5 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="text-lg font-semibold text-gray-900 font-sans">ข้อมูลลดการผลิต</h3>
                </div>
                <div className="px-6 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">เลขที่ใบอนุญาต</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.licenseNumber || ''}
                            onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          request.license_number
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">กำลังการผลิตปัจจุบัน</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={editForm.currentCapacity || ''}
                              onChange={(e) => setEditForm({ ...editForm, currentCapacity: e.target.value })}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-r-none"
                            />
                            <select
                              value={editForm.currentCapacityUnit || ''}
                              onChange={(e) => setEditForm({ ...editForm, currentCapacityUnit: e.target.value })}
                              className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="MW">MW</option>
                              <option value="kW">kW</option>
                            </select>
                          </div>
                        ) : (
                          `${request.current_capacity} ${request.current_capacity_unit}`
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">กำลังการผลิตที่ขอ</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={editForm.requestedCapacity || ''}
                              onChange={(e) => setEditForm({ ...editForm, requestedCapacity: e.target.value })}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-r-none"
                            />
                            <select
                              value={editForm.requestedCapacityUnit || ''}
                              onChange={(e) => setEditForm({ ...editForm, requestedCapacityUnit: e.target.value })}
                              className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="MW">MW</option>
                              <option value="kW">kW</option>
                            </select>
                          </div>
                        ) : (
                          `${request.requested_capacity} ${request.requested_capacity_unit}`
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">เหตุผลที่ขอลดการผลิต</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {isEditing ? (
                          <textarea
                            value={editForm.reductionReason || ''}
                            onChange={(e) => setEditForm({ ...editForm, reductionReason: e.target.value })}
                            rows={4}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          request.reduction_reason
                        )}
                      </dd>
                    </div>
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
                    <p className="text-base font-medium text-gray-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.contactPerson || ''}
                          onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      ) : (
                        request.contactPerson || user?.username
                      )}
                    </p>
                    <p className="text-sm text-gray-500">ผู้ยื่นคำขอ</p>
                  </div>
                </div>
                <dl className="space-y-3">
                  <div className="flex items-center text-sm">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.contactEmail || ''}
                        onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <span className="text-gray-900">{request.contactEmail}</span>
                    )}
                  </div>
                  <div className="flex items-center text-sm">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.contactPhone || ''}
                        onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <span className="text-gray-900">{request.contactPhone}</span>
                    )}
                  </div>
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
                    {request.status_history?.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <div className="relative pb-8">
                          {itemIdx !== request.status_history!.length - 1 ? (
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
                                <time dateTime={item.date}>{new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
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