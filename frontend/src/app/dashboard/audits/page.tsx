'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { apiClient } from '@/lib/api'
import { AuditReport, AuditReportFilters } from '@/types'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

export default function AuditReportsPage() {
  const [filters, setFilters] = useState<AuditReportFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    reporterId: '',
  })

  const { data: auditsData, isLoading, error } = useQuery({
    queryKey: ['audits', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.reporterId) params.append('reporterId', filters.reporterId)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
      
      const response = await apiClient.get<{ audits: AuditReport[]; pagination: any }>(`/api/v1/audits?${params}`)
      return response.data
    },
  })

  const { data: reporters } = useQuery({
    queryKey: ['reporters'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/api/v1/users/reporters')
      return response.data || []
    },
  })

  const handleFilterChange = (key: keyof AuditReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleAuditAction = async (auditId: string, action: string) => {
    try {
      await apiClient.post(`/api/v1/audits/${auditId}/${action}`)
      // Refresh data
      window.location.reload()
    } catch (error) {
      console.error('Failed to perform audit action:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'ร่าง'
      case 'submitted':
        return 'ส่งแล้ว'
      case 'under_review':
        return 'อยู่ระหว่างตรวจสอบ'
      case 'approved':
        return 'อนุมัติ'
      case 'rejected':
        return 'ปฏิเสธ'
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
              <h1 className="text-xl font-semibold text-gray-900">รายงานตรวจสอบ</h1>
              <p className="mt-2 text-sm text-gray-700">
                รายการรายงานตรวจสอบทั้งหมดในระบบ
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                สร้างรายงานใหม่
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
                    placeholder="ค้นหารายงาน..."
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
                  <option value="draft">ร่าง</option>
                  <option value="submitted">ส่งแล้ว</option>
                  <option value="under_review">อยู่ระหว่างตรวจสอบ</option>
                  <option value="approved">อนุมัติ</option>
                  <option value="rejected">ปฏิเสธ</option>
                </select>
              </div>

              <div>
                <label htmlFor="reporterId" className="block text-sm font-medium text-gray-700">
                  ผู้รายงาน
                </label>
                <select
                  id="reporterId"
                  name="reporterId"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filters.reporterId}
                  onChange={(e) => handleFilterChange('reporterId', e.target.value)}
                >
                  <option value="">ทั้งหมด</option>
                  {reporters?.map((reporter) => (
                    <option key={reporter.id} value={reporter.id}>
                      {reporter.firstName} {reporter.lastName}
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
                          ชื่อรายงาน
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          การตรวจสอบ
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ผู้รายงาน
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          วันที่สร้าง
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
                      ) : auditsData?.audits?.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                            ไม่พบข้อมูลรายงานตรวจสอบ
                          </td>
                        </tr>
                      ) : (
                        auditsData?.audits?.map((audit) => (
                          <tr key={audit.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {audit.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {audit.content.substring(0, 100)}...
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {audit.inspection?.location}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(audit.inspection?.scheduledDate || '').toLocaleDateString('th-TH')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {audit.reporter?.firstName} {audit.reporter?.lastName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(audit.createdAt).toLocaleDateString('th-TH')}
                              </div>
                              {audit.submittedDate && (
                                <div className="text-xs text-gray-500">
                                  ส่งเมื่อ: {new Date(audit.submittedDate).toLocaleDateString('th-TH')}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(audit.status)}`}>
                                {getStatusText(audit.status)}
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
                                <button
                                  type="button"
                                  className="text-green-600 hover:text-green-900"
                                  title="ดาวน์โหลด"
                                >
                                  <DocumentArrowDownIcon className="h-5 w-5" />
                                </button>
                                {audit.status === 'draft' && (
                                  <button
                                    type="button"
                                    onClick={() => handleAuditAction(audit.id, 'submit')}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="ส่งรายงาน"
                                  >
                                    <ClockIcon className="h-5 w-5" />
                                  </button>
                                )}
                                {audit.status === 'under_review' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleAuditAction(audit.id, 'approve')}
                                      className="text-green-600 hover:text-green-900"
                                      title="อนุมัติรายงาน"
                                    >
                                      <CheckCircleIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAuditAction(audit.id, 'reject')}
                                      className="text-red-600 hover:text-red-900"
                                      title="ปฏิเสธรายงาน"
                                    >
                                      <XMarkIcon className="h-5 w-5" />
                                    </button>
                                  </>
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
          {auditsData?.pagination && (
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
                  disabled={filters.page! >= auditsData.pagination.totalPages}
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
                      {Math.min(filters.page! * filters.limit!, auditsData.pagination.total)}
                    </span>{' '}
                    จาก <span className="font-medium">{auditsData.pagination.total}</span> รายการ
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
                    {Array.from({ length: Math.min(5, auditsData.pagination.totalPages) }, (_, i) => {
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
                      disabled={filters.page! >= auditsData.pagination.totalPages}
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