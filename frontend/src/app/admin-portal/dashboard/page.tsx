'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import ServiceFlowVisualization from '@/components/admin/ServiceFlowVisualization'
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  inProgressRequests: number
  completedRequests: number
  rejectedRequests: number
}

interface ServiceSummary {
  license_type: string
  status: string
  count: number
}

interface TimelineData {
  date: string
  count: number
}

interface PerformanceStats {
  average_processing_time_days: number
  fastest_processing_time_days: number
  slowest_processing_time_days: number
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [selectedTimeRange, setSelectedTimeRange] = useState('30')

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardStats>('/api/v1/admin-portal/dashboard/stats')
      return response.data
    },
  })

  // Fetch service summary statistics
  const { data: serviceSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['admin-service-summary'],
    queryFn: async () => {
      const response = await apiClient.get<ServiceSummary[]>('/api/v1/admin-portal/dashboard/stats/summary')
      return response.data
    },
  })

  // Fetch timeline statistics
  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ['admin-timeline-stats', selectedTimeRange],
    queryFn: async () => {
      const response = await apiClient.get<TimelineData[]>('/api/v1/admin-portal/dashboard/stats/timeline')
      return response.data
    },
  })

  // Fetch performance statistics
  const { data: performanceStats, isLoading: performanceLoading } = useQuery({
    queryKey: ['admin-performance-stats'],
    queryFn: async () => {
      const response = await apiClient.get<PerformanceStats>('/api/v1/admin-portal/dashboard/stats/performance')
      return response.data
    },
  })

  const statsCards = [
    {
      name: 'คำขอทั้งหมด',
      value: stats?.totalRequests || 0,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      name: 'รอดำเนินการ',
      value: stats?.pendingRequests || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      name: 'กำลังดำเนินการ',
      value: stats?.inProgressRequests || 0,
      icon: ClipboardDocumentCheckIcon,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      name: 'เสร็จสิ้น',
      value: stats?.completedRequests || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      name: 'ปฏิเสธ',
      value: stats?.rejectedRequests || 0,
      icon: XCircleIcon,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ]

  const getLicenseTypeDisplayName = (type: string) => {
    switch (type) {
      case 'new':
        return 'ขอรับใบอนุญาตใหม่'
      case 'renew':
        return 'ขอต่ออายุใบอนุญาต'
      case 'expand':
        return 'ขอขยายการผลิต'
      case 'reduce':
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
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'system_admin':
        return 'ผู้ดูแลระบบ'
      case 'dede_head_admin':
        return 'ผู้บริหาร DEDE'
      case 'dede_staff_admin':
        return 'เจ้าหน้าที่ DEDE'
      case 'dede_consult_admin':
        return 'ที่ปรึกษา DEDE'
      case 'auditor_admin':
        return 'ผู้ตรวจสอบ'
      case 'admin':
        return 'ผู้ดูแลระบบ'
      default:
        return role
    }
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome message */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-bold text-lg">
                  {user?.fullName?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">
                แดชบอร์ดผู้ดูแลระบบ
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                ยินดีต้อนรับ, <span className="font-semibold text-gray-900">{user?.fullName}</span>
              </p>
              <p className="text-sm text-gray-500">
                ตำแหน่ง: <span className="font-medium">{getRoleDisplayName(user?.role || '')}</span>
                {user?.email && (
                  <span className="ml-3">
                    อีเมล: <span className="font-medium">{user?.email}</span>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          {statsCards.map((card) => (
            <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${card.bgColor} rounded-lg p-3`}>
                    <card.icon className={`h-6 w-6 ${card.textColor}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{card.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Performance metrics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">เวลาดำเนินการเฉลี่ย</h3>
                <p className="text-2xl font-semibold text-indigo-600">
                  {performanceStats?.average_processing_time_days?.toFixed(1) || '0'} วัน
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">ดำเนินการเร็วที่สุด</h3>
                <p className="text-2xl font-semibold text-green-600">
                  {performanceStats?.fastest_processing_time_days?.toFixed(1) || '0'} วัน
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingDownIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">ดำเนินการช้าที่สุด</h3>
                <p className="text-2xl font-semibold text-red-600">
                  {performanceStats?.slowest_processing_time_days?.toFixed(1) || '0'} วัน
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Service flow visualization */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          {/* Service summary by type and status */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                สรุปคำขอตามประเภทและสถานะ
              </h3>
              <div className="flow-root">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ประเภทคำขอ
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สถานะ
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          จำนวน
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {serviceSummary?.slice(0, 10).map((item, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {getLicenseTypeDisplayName(item.license_type)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                              {getStatusDisplayName(item.status)}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.count}
                          </td>
                        </tr>
                      ))}
                      {serviceSummary?.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-3 py-2 text-center text-sm text-gray-500">
                            ไม่มีข้อมูล
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                การจัดการด่วน
              </h3>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-yellow-800">
                        คำขอที่รอดำเนินการ ({stats?.pendingRequests || 0})
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        คำขอใหม่ที่ต้องการการดำเนินการ
                      </p>
                    </div>
                    <Link
                      href="/admin-portal/services?status=pending"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      ดำเนินการ
                    </Link>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-6 w-6 text-orange-600 mr-3" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-orange-800">
                        คำขอที่กำลังดำเนินการ ({stats?.inProgressRequests || 0})
                      </h4>
                      <p className="text-sm text-orange-700 mt-1">
                        คำขอที่อยู่ในระหว่างการตรวจสอบ
                      </p>
                    </div>
                    <Link
                      href="/admin-portal/services?status=in_progress"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-orange-800 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      ตรวจสอบ
                    </Link>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-800">
                        จัดการผู้ใช้งาน
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        จัดการสิทธิ์และบทบาทผู้ใช้งาน
                      </p>
                    </div>
                    <Link
                      href="/admin-portal/users"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-800 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      จัดการ
                    </Link>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-6 w-6 text-green-600 mr-3" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-green-800">
                        จัดการคำขอทั้งหมด
                      </h4>
                      <p className="text-sm text-green-700 mt-1">
                        ดูและจัดการคำขอทั้งหมดในระบบ
                      </p>
                    </div>
                    <Link
                      href="/admin-portal/services"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-800 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      จัดการคำขอ
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Flow Visualization */}
        <div className="mb-8">
          <ServiceFlowVisualization compact={true} />
        </div>

        {/* Timeline chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                แนวโน้มคำขอล่าสุด
              </h3>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="7">7 วัน</option>
                <option value="30">30 วัน</option>
                <option value="90">90 วัน</option>
              </select>
            </div>
            <div className="h-64">
              <div className="h-full flex items-end space-x-2">
                {timelineData?.map((item, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${Math.max((item.count / Math.max(...timelineData.map(d => d.count))) * 100, 5)}%` }}
                    title={`${item.date}: ${item.count} คำขอ`}
                  >
                    <div className="text-xs text-white text-center pt-1">
                      {item.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}