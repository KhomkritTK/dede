'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { apiClient } from '@/lib/api'
import {
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface LicenseRequest {
  id: number
  request_number: string
  user_id: number
  license_type: string
  status: string
  title: string
  description: string
  request_date: string
  user: {
    id: number
    username: string
    full_name: string
    email: string
  }
}

// Updated interface to match the new API response
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

export default function AdminServicesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // Fetch license requests from all four tables
  const { data: licenseRequests, isLoading } = useQuery({
    queryKey: ['admin-license-requests', searchTerm, statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('licenseType', typeFilter)
      
      const response = await apiClient.get<UnifiedLicenseRequest[]>(`/api/v1/admin-portal/services/requests?${params}`)
      return response.data
    },
  })

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

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            จัดการคำขอบริการ
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            ติดตามและจัดการคำขอทั้ง 4 ประเภทจาก Web View
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ค้นหาคำขอ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">ทุกสถานะ</option>
                <option value="new_request">คำร้องใหม่</option>
                <option value="accepted">รับคำขอ</option>
                <option value="assigned">มอบหมายผู้ตรวจ</option>
                <option value="appointment">นัดหมาย</option>
                <option value="inspecting">เข้าตรวจสอบระบบ</option>
                <option value="inspection_done">ตรวจสอบเสร็จสิ้น</option>
                <option value="document_edit">แก้ไขเอกสาร</option>
                <option value="report_approved">รับรองรายงาน</option>
                <option value="approved">อนุมัติใบอนุญาต</option>
                <option value="rejected">ปฏิเสธคำขอ</option>
                <option value="returned">ตีเอกสารกลับไปแก้ไข</option>
                <option value="forwarded">ส่งต่อให้ DEDE Head</option>
              </select>
            </div>

            <div>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">ทุกประเภท</option>
                <option value="new">ขอรับใบอนุญาตใหม่</option>
                <option value="renewal">ขอต่ออายุใบอนุญาต</option>
                <option value="extension">ขอขยายการผลิต</option>
                <option value="reduction">ขอลดการผลิต</option>
              </select>
            </div>

            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">ตัวกรอง</span>
            </div>
          </div>
        </div>

        {/* Requests table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {licenseRequests?.map((request) => (
              <li key={request.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {request.title}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {getStatusDisplayName(request.status)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center space-x-4">
                          <p className="text-sm text-gray-500">
                            เลขที่คำขอ: {request.request_number}
                          </p>
                          <p className="text-sm text-gray-500">
                            ประเภท: {getLicenseTypeDisplayName(request.license_type)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ผู้ยื่น: {request.user.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            วันที่: {new Date(request.request_date).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {request.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin-portal/services/${request.id}?type=${request.license_type}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        ดูรายละเอียด
                      </Link>
                      <button
                        className="inline-flex items-center px-3 py-1 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        จัดการ
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {licenseRequests?.length === 0 && (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่พบคำขอ</h3>
              <p className="mt-1 text-sm text-gray-500">
                ไม่มีคำขอที่ตรงกับเงื่อนไขการค้นหา
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}