/*
 * HomePage - Home page for the DEDE E-Service Web View
 * Provides overview of services and user dashboard
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import PublicLayout from '@/components/layout/PublicLayout'
import Link from 'next/link'
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

interface ServiceCard {
  title: string
  description: string
  icon: React.ComponentType<any>
  link: string
  color: string
  bgGradient: string
}

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [userRequests, setUserRequests] = useState<any[]>([])

  useEffect(() => {
    // Fetch user requests if authenticated
    if (isAuthenticated) {
      // Simulate API call to fetch user requests
      setTimeout(() => {
        setUserRequests([
          {
            id: '1',
            requestNumber: 'REQ-2023-001',
            type: 'new_license',
            title: 'คำขอใบอนุญาตผลิตไฟฟ้าจากพลังงานแสงอาทิตย์',
            status: 'under_review',
            submittedDate: '2023-10-01',
            lastUpdated: '2023-10-05'
          },
          {
            id: '2',
            requestNumber: 'REQ-2023-002',
            type: 'renewal',
            title: 'คำขอต่ออายุใบอนุญาตผลิตไฟฟ้าจากพลังงานลม',
            status: 'approved',
            submittedDate: '2023-09-15',
            lastUpdated: '2023-09-20'
          }
        ])
      }, 1000)
    }
  }, [isAuthenticated])

  const services: ServiceCard[] = [
    {
      title: 'ขอรับใบอนุญาตใหม่',
      description: 'สำหรับการขอรับใบอนุญาตในการผลิตไฟฟ้าจากพลังงานทดแทน',
      icon: DocumentTextIcon,
      link: '/eservice/dede/license/new',
      color: 'text-green-600',
      bgGradient: 'from-green-500 to-green-600'
    },
    {
      title: 'ขอต่ออายุใบอนุญาต',
      description: 'สำหรับการขอต่ออายุใบอนุญาตที่กำลังจะหมดอายุ',
      icon: ArrowRightIcon,
      link: '/eservice/dede/license/renewal',
      color: 'text-blue-600',
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'ขอขยายการผลิต',
      description: 'สำหรับการขอขยายกำลังการผลิตไฟฟ้า',
      icon: ArrowRightIcon,
      link: '/eservice/dede/license/extension',
      color: 'text-yellow-600',
      bgGradient: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'ขอลดการผลิต',
      description: 'สำหรับการขอลดกำลังการผลิตไฟฟ้า',
      icon: ArrowRightIcon,
      link: '/eservice/dede/license/reduction',
      color: 'text-red-600',
      bgGradient: 'from-red-500 to-red-600'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <div className="h-5 w-5 bg-gray-400 rounded-full"></div>
      case 'submitted':
        return <div className="h-5 w-5 bg-blue-500 rounded-full"></div>
      case 'under_review':
        return <div className="h-5 w-5 bg-yellow-500 rounded-full"></div>
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <div className="h-5 w-5 bg-red-500 rounded-full"></div>
      default:
        return <div className="h-5 w-5 bg-gray-400 rounded-full"></div>
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

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">DEDE E-Service</h1>
            <p className="text-xl max-w-3xl mx-auto">
              ระบบบริการอิเล็กทรอนิกส์สำหรับการจัดการใบอนุญาตผลิตไฟฟ้าจากพลังงานทดแทน
            </p>
            <div className="mt-8">
              {isAuthenticated ? (
                <Link
                  href="/eservice/dede/services"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-white bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                >
                  ดำเนินการต่อ
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <div className="space-x-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-white bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                  >
                    สมัครสมาชิก
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">บริการของเรา</h2>
            <p className="mt-4 text-lg text-gray-600">
              บริการทั้งหมดที่เรามีให้สำหรับการจัดการใบอนุญาตพลังงานทดแทน
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div key={service.title} className="relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className={`p-6 bg-gradient-to-r ${service.bgGradient}`}>
                  <div className="flex items-center justify-center h-12 w-12 bg-white bg-opacity-20 rounded-lg">
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Link
                    href={service.link}
                    className={`inline-flex items-center ${service.color} font-medium hover:underline`}
                  >
                    เริ่มต้น
                    <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Dashboard Section - Only show if authenticated */}
      {isAuthenticated && (
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">คำขอล่าสุดของฉัน</h2>
              <p className="mt-2 text-gray-600">ติดตามสถานะคำขอใบอนุญาตของคุณ</p>
            </div>

            {userRequests.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {userRequests.map((request) => (
                    <li key={request.id}>
                      <Link href={`/eservice/dede/license/${request.id}`} className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 mr-4">
                                {getStatusIcon(request.status)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-blue-600">
                                  {request.requestNumber}
                                </p>
                                <p className="text-base font-medium text-gray-900">
                                  {request.title}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  ส่งเมื่อ {request.submittedDate}
                                </p>
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                request.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                                request.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {getStatusText(request.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="px-4 py-4 sm:px-6 bg-gray-50 text-right">
                  <Link
                    href="/eservice/dede/requests"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    ดูคำขอทั้งหมด <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่มีคำขอ</h3>
                <p className="mt-1 text-sm text-gray-500">
                  คุณยังไม่ได้ส่งคำขอใดๆ
                </p>
                <div className="mt-6">
                  <Link
                    href="/eservice/dede/services"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    สร้างคำขอใหม่
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PublicLayout>
  )
}