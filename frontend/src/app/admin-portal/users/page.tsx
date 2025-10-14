'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { apiClient } from '@/lib/api'
import {
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface AdminUser {
  id: number
  user_id: number
  admin_role: string
  department: string
  permissions: any
  created_at: string
  updated_at: string
  user: {
    id: number
    username: string
    email: string
    full_name: string
    role: string
    status: string
  }
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch admin users
  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ['admin-users', currentPage, searchTerm],
    queryFn: async () => {
      const response = await apiClient.get<{ users: AdminUser[] }>('/api/v1/admin-portal/admin/users')
      return response.data
    },
  })

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
      default:
        return role
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'system_admin':
        return 'bg-purple-100 text-purple-800'
      case 'dede_head_admin':
        return 'bg-blue-100 text-blue-800'
      case 'dede_staff_admin':
        return 'bg-green-100 text-green-800'
      case 'dede_consult_admin':
        return 'bg-yellow-100 text-yellow-800'
      case 'auditor_admin':
        return 'bg-orange-100 text-orange-800'
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                จัดการผู้ใช้งานแอดมิน
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                จัดการบัญชีผู้ใช้งานและสิทธิ์การใช้งานในระบบ
              </p>
            </div>
            <Link
              href="/admin-portal/users/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              เพิ่มผู้ใช้งาน
            </Link>
          </div>
        </div>

        {/* Search and filters */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="ค้นหาผู้ใช้งาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {adminUsers?.users?.map((adminUser) => (
              <li key={adminUser.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UserGroupIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {adminUser.user.full_name}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(adminUser.user.status)}`}>
                            {adminUser.user.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center space-x-4">
                          <p className="text-sm text-gray-500">
                            ชื่อผู้ใช้: {adminUser.user.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            อีเมล: {adminUser.user.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            แผนก: {adminUser.department}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(adminUser.admin_role)}`}>
                            {getRoleDisplayName(adminUser.admin_role)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin-portal/users/${adminUser.id}/edit`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        แก้ไข
                      </Link>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {adminUsers?.users?.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่พบผู้ใช้งาน</h3>
              <p className="mt-1 text-sm text-gray-500">
                ไม่มีผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหา
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {adminUsers && adminUsers.users && adminUsers.users.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                แสดง <span className="font-medium">1</span> ถึง{' '}
                <span className="font-medium">{adminUsers.users.length}</span> จากทั้งหมด{' '}
                <span className="font-medium">{adminUsers.users.length}</span> รายการ
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                >
                  ก่อนหน้า
                </button>
                <button
                  type="button"
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {currentPage}
                </button>
                <button
                  type="button"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}