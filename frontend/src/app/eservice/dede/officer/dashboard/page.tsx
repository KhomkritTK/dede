'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { LicenseRequest, Inspection, AuditReport, Notification } from '@/types'
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  BellIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function OfficerDashboardPage() {
  const { user } = useAuth()

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [licensesRes, inspectionsRes, auditsRes, notificationsRes] = await Promise.all([
        apiClient.get<{ total: number; pending: number; approved: number; rejected: number }>('/api/v1/licenses/stats'),
        apiClient.get<{ total: number; scheduled: number; inProgress: number; completed: number }>('/api/v1/inspections/stats'),
        apiClient.get<{ total: number; draft: number; submitted: number; approved: number }>('/api/v1/audits/stats'),
        apiClient.get<{ total: number; unread: number }>('/api/v1/notifications/stats'),
      ])

      return {
        licenses: licensesRes.data || { total: 0, pending: 0, approved: 0, rejected: 0 },
        inspections: inspectionsRes.data || { total: 0, scheduled: 0, inProgress: 0, completed: 0 },
        audits: auditsRes.data || { total: 0, draft: 0, submitted: 0, approved: 0 },
        notifications: notificationsRes.data || { total: 0, unread: 0 },
      }
    },
  })

  // Fetch recent items
  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ['dashboard-recent'],
    queryFn: async () => {
      const [licensesRes, inspectionsRes, notificationsRes] = await Promise.all([
        apiClient.get<LicenseRequest[]>('/api/v1/licenses?limit=5&sortBy=createdAt&sortOrder=desc'),
        apiClient.get<Inspection[]>('/api/v1/inspections?limit=5&sortBy=createdAt&sortOrder=desc'),
        apiClient.get<Notification[]>('/api/v1/notifications/my?limit=5&sortBy=createdAt&sortOrder=desc'),
      ])

      return {
        licenses: licensesRes.data || [],
        inspections: inspectionsRes.data || [],
        notifications: notificationsRes.data || [],
      }
    },
  })

  const statsCards = [
    {
      name: 'คำขอใบอนุญาตทั้งหมด',
      value: stats?.licenses.total || 0,
      change: stats?.licenses.pending || 0,
      changeType: 'pending' as const,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'การตรวจสอบทั้งหมด',
      value: stats?.inspections.total || 0,
      change: stats?.inspections.inProgress || 0,
      changeType: 'progress' as const,
      icon: ClipboardDocumentCheckIcon,
      color: 'bg-green-500',
    },
    {
      name: 'รายงานตรวจสอบทั้งหมด',
      value: stats?.audits.total || 0,
      change: stats?.audits.submitted || 0,
      changeType: 'submitted' as const,
      icon: DocumentMagnifyingGlassIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'การแจ้งเตือน',
      value: stats?.notifications.total || 0,
      change: stats?.notifications.unread || 0,
      changeType: 'unread' as const,
      icon: BellIcon,
      color: 'bg-red-500',
    },
  ]

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
      case 'scheduled':
        return 'bg-purple-100 text-purple-800'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
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
      case 'scheduled':
        return 'นัดหมาย'
      case 'in_progress':
        return 'กำลังดำเนินการ'
      case 'completed':
        return 'เสร็จสิ้น'
      default:
        return status
    }
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            ยินดีต้อนรับกลับมา, {user?.fullName}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            นี่คือภาพรวมของระบบ E-Service สำหรับ Web Portal
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statsCards.map((card) => (
            <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <card.icon className={`h-6 w-6 text-white ${card.color} rounded-lg p-1`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{card.value}</div>
                        {card.change > 0 && (
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            card.changeType === 'pending' ? 'text-yellow-600' :
                            card.changeType === 'progress' ? 'text-orange-600' :
                            card.changeType === 'submitted' ? 'text-blue-600' :
                            'text-red-600'
                          }`}>
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {card.change}
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  {card.changeType === 'pending' && <span className="text-yellow-600">รอดำเนินการ</span>}
                  {card.changeType === 'progress' && <span className="text-orange-600">กำลังดำเนินการ</span>}
                  {card.changeType === 'submitted' && <span className="text-blue-600">ส่งแล้ว</span>}
                  {card.changeType === 'unread' && <span className="text-red-600">ยังไม่อ่าน</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent items */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent license requests */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                คำขอใบอนุญาตล่าสุด
              </h3>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentData?.licenses.map((license) => (
                    <li key={license.id} className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {license.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {license.requestNumber}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(license.status)}`}>
                            {getStatusText(license.status)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                  {recentData?.licenses.length === 0 && (
                    <li className="py-4">
                      <p className="text-sm text-gray-500">ไม่มีคำขอล่าสุด</p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Recent inspections */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                การตรวจสอบล่าสุด
              </h3>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentData?.inspections.map((inspection) => (
                    <li key={inspection.id} className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <ClipboardDocumentCheckIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {inspection.location}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(inspection.scheduledDate).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                            {getStatusText(inspection.status)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                  {recentData?.inspections.length === 0 && (
                    <li className="py-4">
                      <p className="text-sm text-gray-500">ไม่มีการตรวจสอบล่าสุด</p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Recent notifications */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                การแจ้งเตือนล่าสุด
              </h3>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentData?.notifications.map((notification) => (
                    <li key={notification.id} className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <BellIcon className={`h-6 w-6 ${notification.isRead ? 'text-gray-400' : 'text-yellow-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                        <div>
                          {!notification.isRead && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ใหม่
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                  {recentData?.notifications.length === 0 && (
                    <li className="py-4">
                      <p className="text-sm text-gray-500">ไม่มีการแจ้งเตือนล่าสุด</p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}