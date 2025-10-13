'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { apiClient } from '@/lib/api'
import { Inspection, InspectionFilters } from '@/types'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  PlayIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export default function InspectionsPage() {
  const [filters, setFilters] = useState<InspectionFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    inspectorId: '',
  })

  const { data: inspectionsData, isLoading, error } = useQuery({
    queryKey: ['inspections', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.inspectorId) params.append('inspectorId', filters.inspectorId)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
      
      const response = await apiClient.get<{ inspections: Inspection[]; pagination: any }>(`/api/v1/inspections?${params}`)
      return response.data
    },
  })

  const { data: inspectors } = useQuery({
    queryKey: ['inspectors'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/api/v1/users/inspectors')
      return response.data || []
    },
  })

  const handleFilterChange = (key: keyof InspectionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleInspectionAction = async (inspectionId: string, action: string) => {
    try {
      await apiClient.post(`/api/v1/inspections/${inspectionId}/${action}`)
      // Refresh data
      window.location.reload()
    } catch (error) {
      console.error('Failed to perform inspection action:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-purple-100 text-purple-800'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'นัดหมาย'
      case 'in_progress':
        return 'กำลังดำเนินการ'
      case 'completed':
        return 'เสร็จสิ้น'
      case 'cancelled':
        return 'ยกเลิก'
      default:
        return status
    }
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">การตรวจสอบ</h1>
              <p className="mt-2 text-sm text-gray-700">
                รายการการตรวจสอบทั้งหมดในระบบ
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                สร้างการตรวจสอบใหม่
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-8 bg-white shadow rounded-lg p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  ค้นหา
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="ค้นหาการตรวจสอบ..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  สถานะ
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">ทั้งหมด</option>
                  <option value="scheduled">นัดหมาย</option>
                  <option value="in_progress">กำลังดำเนินการ</option>
                  <option value="completed">เสร็จสิ้น</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>
              </div>

              <div>
                <label htmlFor="inspectorId" className="block text-sm font-medium text-gray-700">
                  ผู้ตรวจสอบ
                </label>
                <select
                  id="inspectorId"
                  name="inspectorId"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filters.inspectorId}
                  onChange={(e) => handleFilterChange('inspectorId', e.target.value)}
                >
                  <option value="">ทั้งหมด</option>
                  {inspectors?.map((inspector) => (
                    <option key={inspector.id} value={inspector.id}>
                      {inspector.firstName} {inspector.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <FunnelIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  ตัวกรองเพิ่มเติม
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          คำขอใบอนุญาต
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สถานที่
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ผู้ตรวจสอบ
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          วันที่นัดหมาย
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สถานะ
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                            กำลังโหลด...
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-red-500">
                            เกิดข้อผิดพลาดในการโหลดข้อมูล
                          </td>
                        </tr>
                      ) : inspectionsData?.inspections?.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                            ไม่พบข้อมูลการตรวจสอบ
                          </td>
                        </tr>
                      ) : (
                        inspectionsData?.inspections?.map((inspection) => (
                          <tr key={inspection.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {inspection.licenseRequest?.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {inspection.licenseRequest?.requestNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900">
                                <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                                {inspection.location}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900">
                                <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                                {inspection.inspector?.firstName} {inspection.inspector?.lastName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900">
                                <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                                {new Date(inspection.scheduledDate).toLocaleDateString('th-TH')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(inspection.scheduledDate).toLocaleTimeString('th-TH', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inspection.status)}`}>
                                {getStatusText(inspection.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  type="button"
                                  className="text-primary-600 hover:text-primary-900"
                                  title="ดูรายละเอียด"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  className="text-secondary-600 hover:text-secondary-900"
                                  title="แก้ไข"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                {inspection.status === 'scheduled' && (
                                  <button
                                    type="button"
                                    onClick={() => handleInspectionAction(inspection.id, 'start')}
                                    className="text-green-600 hover:text-green-900"
                                    title="เริ่มตรวจสอบ"
                                  >
                                    <PlayIcon className="h-5 w-5" />
                                  </button>
                                )}
                                {inspection.status === 'in_progress' && (
                                  <button
                                    type="button"
                                    onClick={() => handleInspectionAction(inspection.id, 'complete')}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="เสร็จสิ้นการตรวจสอบ"
                                  >
                                    <CheckCircleIcon className="h-5 w-5" />
                                  </button>
                                )}
                                {(inspection.status === 'scheduled' || inspection.status === 'in_progress') && (
                                  <button
                                    type="button"
                                    onClick={() => handleInspectionAction(inspection.id, 'cancel')}
                                    className="text-red-600 hover:text-red-900"
                                    title="ยกเลิกการตรวจสอบ"
                                  >
                                    <XMarkIcon className="h-5 w-5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {inspectionsData?.pagination && (
            <div className="mt-8 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(filters.page! - 1)}
                  disabled={filters.page! <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  ก่อนหน้า
                </button>
                <button
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={filters.page! >= inspectionsData.pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  ถัดไป
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    แสดง <span className="font-medium">{((filters.page! - 1) * filters.limit!) + 1}</span> ถึง{' '}
                    <span className="font-medium">
                      {Math.min(filters.page! * filters.limit!, inspectionsData.pagination.total)}
                    </span>{' '}
                    จาก <span className="font-medium">{inspectionsData.pagination.total}</span> รายการ
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(filters.page! - 1)}
                      disabled={filters.page! <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      ก่อนหน้า
                    </button>
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, inspectionsData.pagination.totalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === filters.page
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => handlePageChange(filters.page! + 1)}
                      disabled={filters.page! >= inspectionsData.pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      ถัดไป
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}