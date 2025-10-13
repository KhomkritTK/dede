'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { apiClient } from '@/lib/api'
import { Notification, NotificationFilters } from '@/types'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  BellIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

export default function NotificationsPage() {
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    limit: 10,
    search: '',
    isRead: undefined,
    type: '',
    priority: '',
  })

  const queryClient = useQueryClient()

  const { data: notificationsData, isLoading, error } = useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.isRead !== undefined) params.append('isRead', filters.isRead.toString())
      if (filters.type) params.append('type', filters.type)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
      
      const response = await apiClient.get<{ notifications: Notification[]; pagination: any }>(`/api/v1/notifications/my?${params}`)
      return response.data
    },
  })

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiClient.post(`/api/v1/notifications/${notificationId}/mark-read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.post('/api/v1/notifications/my/mark-all-read')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiClient.delete(`/api/v1/notifications/${notificationId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const handleFilterChange = (key: keyof NotificationFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleMarkAsRead = async (notificationId: string) => {
    markAsReadMutation.mutate(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    markAllAsReadMutation.mutate()
  }

  const handleDelete = async (notificationId: string) => {
    if (confirm('คุณต้องการลบการแจ้งเตือนนี้ใช่หรือไม่?')) {
      deleteNotificationMutation.mutate(notificationId)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800'
      case 'medium':
        return 'bg-blue-100 text-blue-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'urgent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'ต่ำ'
      case 'medium':
        return 'ปานกลาง'
      case 'high':
        return 'สูง'
      case 'urgent':
        return 'เร่งด่วน'
      default:
        return priority
    }
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">การแจ้งเตือน</h1>
              <p className="mt-2 text-sm text-gray-700">
                รายการการแจ้งเตือนทั้งหมดของคุณ
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-secondary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 sm:w-auto disabled:opacity-50"
              >
                <CheckIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                ทำเครื่องหมายอ่านทั้งหมด
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                สร้างการแจ้งเตือน
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
                    placeholder="ค้นหาการแจ้งเตือน..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="isRead" className="block text-sm font-medium text-gray-700">
                  สถานะการอ่าน
                </label>
                <select
                  id="isRead"
                  name="isRead"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filters.isRead === undefined ? '' : filters.isRead.toString()}
                  onChange={(e) => handleFilterChange('isRead', e.target.value === '' ? undefined : e.target.value === 'true')}
                >
                  <option value="">ทั้งหมด</option>
                  <option value="false">ยังไม่อ่าน</option>
                  <option value="true">อ่านแล้ว</option>
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  ประเภท
                </label>
                <select
                  id="type"
                  name="type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">ทั้งหมด</option>
                  <option value="info">ข้อมูล</option>
                  <option value="warning">คำเตือน</option>
                  <option value="success">สำเร็จ</option>
                  <option value="error">ข้อผิดพลาด</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  ความสำคัญ
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <option value="">ทั้งหมด</option>
                  <option value="low">ต่ำ</option>
                  <option value="medium">ปานกลาง</option>
                  <option value="high">สูง</option>
                  <option value="urgent">เร่งด่วน</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
            {isLoading ? (
              <div className="px-4 py-5 text-center text-sm text-gray-500">
                กำลังโหลด...
              </div>
            ) : error ? (
              <div className="px-4 py-5 text-center text-sm text-red-500">
                เกิดข้อผิดพลาดในการโหลดข้อมูล
              </div>
            ) : notificationsData?.notifications?.length === 0 ? (
              <div className="px-4 py-5 text-center text-sm text-gray-500">
                ไม่พบข้อมูลการแจ้งเตือน
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notificationsData?.notifications?.map((notification) => (
                  <li key={notification.id}>
                    <div className={`px-4 py-4 sm:px-6 ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium text-gray-900 truncate ${!notification.isRead ? 'font-bold' : ''}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {notification.message}
                            </p>
                            <div className="mt-2 flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                                {getPriorityText(notification.priority)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(notification.createdAt).toLocaleDateString('th-TH')} {new Date(notification.createdAt).toLocaleTimeString('th-TH')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              <CheckIcon className="h-3 w-3 mr-1" />
                              อ่านแล้ว
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(notification.id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <XMarkIcon className="h-3 w-3 mr-1" />
                            ลบ
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pagination */}
          {notificationsData?.pagination && (
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
                  disabled={filters.page! >= notificationsData.pagination.totalPages}
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
                      {Math.min(filters.page! * filters.limit!, notificationsData.pagination.total)}
                    </span>{' '}
                    จาก <span className="font-medium">{notificationsData.pagination.total}</span> รายการ
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
                    {Array.from({ length: Math.min(5, notificationsData.pagination.totalPages) }, (_, i) => {
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
                      disabled={filters.page! >= notificationsData.pagination.totalPages}
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