'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { apiClient } from '@/lib/api'
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface ServiceFlowStep {
  id: string
  name: string
  description: string
  status: 'completed' | 'in_progress' | 'pending' | 'rejected'
  count: number
  color: string
  icon: React.ComponentType<any>
}

interface ServiceFlowData {
  serviceType: string
  steps: ServiceFlowStep[]
  totalCount: number
}

interface ServiceFlowVisualizationProps {
  serviceType?: string
  compact?: boolean
}

export default function ServiceFlowVisualization({ serviceType, compact = false }: ServiceFlowVisualizationProps) {
  const [selectedService, setSelectedService] = useState(serviceType || 'all')

  // Fetch service flow data
  const { data: flowData, isLoading } = useQuery({
    queryKey: ['admin-service-flow', selectedService],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/api/v1/admin-portal/flow/logs')
      return response.data
    },
    enabled: !!selectedService,
  })

  // Mock service flow data for the 4 services
  const mockServiceFlows: ServiceFlowData[] = [
    {
      serviceType: 'new',
      totalCount: 45,
      steps: [
        {
          id: 'new_request',
          name: 'รับคำขอ',
          description: 'รับคำขอขอรับใบอนุญาตใหม่',
          status: 'completed',
          count: 45,
          color: 'bg-blue-500',
          icon: DocumentTextIcon,
        },
        {
          id: 'accept',
          name: 'ตรวจสอบคุณสมบัติ',
          description: 'ตรวจสอบคุณสมบัติและเอกสาร',
          status: 'in_progress',
          count: 32,
          color: 'bg-yellow-500',
          icon: ClockIcon,
        },
        {
          id: 'assign',
          name: 'มอบหมายผู้ตรวจ',
          description: 'มอบหมายเจ้าหน้าที่ผู้ตรวจสอบ',
          status: 'in_progress',
          count: 28,
          color: 'bg-orange-500',
          icon: ClockIcon,
        },
        {
          id: 'appointment',
          name: 'นัดหมายตรวจสอบ',
          description: 'นัดหมายวันเข้าตรวจสอบพื้นที่',
          status: 'pending',
          count: 15,
          color: 'bg-gray-500',
          icon: ClockIcon,
        },
        {
          id: 'inspection',
          name: 'ตรวจสอบพื้นที่',
          description: 'เจ้าหน้าที่เข้าตรวจสอบพื้นที่จริง',
          status: 'pending',
          count: 8,
          color: 'bg-gray-500',
          icon: ClockIcon,
        },
        {
          id: 'approve',
          name: 'อนุมัติใบอนุญาต',
          description: 'อนุมัติใบอนุญาตหลังตรวจสอบ',
          status: 'pending',
          count: 3,
          color: 'bg-gray-500',
          icon: CheckCircleIcon,
        },
      ],
    },
    {
      serviceType: 'renew',
      totalCount: 32,
      steps: [
        {
          id: 'new_request',
          name: 'รับคำขอ',
          description: 'รับคำขอต่ออายุใบอนุญาต',
          status: 'completed',
          count: 32,
          color: 'bg-blue-500',
          icon: DocumentTextIcon,
        },
        {
          id: 'accept',
          name: 'ตรวจสอบคุณสมบัติ',
          description: 'ตรวจสอบคุณสมบัติและเอกสาร',
          status: 'in_progress',
          count: 25,
          color: 'bg-yellow-500',
          icon: ClockIcon,
        },
        {
          id: 'assign',
          name: 'มอบหมายผู้ตรวจ',
          description: 'มอบหมายเจ้าหน้าที่ผู้ตรวจสอบ',
          status: 'in_progress',
          count: 18,
          color: 'bg-orange-500',
          icon: ClockIcon,
        },
        {
          id: 'approve',
          name: 'อนุมัติต่ออายุ',
          description: 'อนุมัติการต่ออายุใบอนุญาต',
          status: 'pending',
          count: 10,
          color: 'bg-gray-500',
          icon: CheckCircleIcon,
        },
      ],
    },
    {
      serviceType: 'expand',
      totalCount: 18,
      steps: [
        {
          id: 'new_request',
          name: 'รับคำขอ',
          description: 'รับคำขอขยายการผลิต',
          status: 'completed',
          count: 18,
          color: 'bg-blue-500',
          icon: DocumentTextIcon,
        },
        {
          id: 'accept',
          name: 'ตรวจสอบคุณสมบัติ',
          description: 'ตรวจสอบคุณสมบัติและเอกสาร',
          status: 'in_progress',
          count: 14,
          color: 'bg-yellow-500',
          icon: ClockIcon,
        },
        {
          id: 'assign',
          name: 'มอบหมายผู้ตรวจ',
          description: 'มอบหมายเจ้าหน้าที่ผู้ตรวจสอบ',
          status: 'in_progress',
          count: 10,
          color: 'bg-orange-500',
          icon: ClockIcon,
        },
        {
          id: 'appointment',
          name: 'นัดหมายตรวจสอบ',
          description: 'นัดหมายวันเข้าตรวจสอบพื้นที่',
          status: 'pending',
          count: 6,
          color: 'bg-gray-500',
          icon: ClockIcon,
        },
        {
          id: 'inspection',
          name: 'ตรวจสอบพื้นที่',
          description: 'เจ้าหน้าที่เข้าตรวจสอบพื้นที่จริง',
          status: 'pending',
          count: 4,
          color: 'bg-gray-500',
          icon: ClockIcon,
        },
        {
          id: 'approve',
          name: 'อนุมัติขยาย',
          description: 'อนุมัติการขยายการผลิต',
          status: 'pending',
          count: 2,
          color: 'bg-gray-500',
          icon: CheckCircleIcon,
        },
      ],
    },
    {
      serviceType: 'reduce',
      totalCount: 12,
      steps: [
        {
          id: 'new_request',
          name: 'รับคำขอ',
          description: 'รับคำขอลดการผลิต',
          status: 'completed',
          count: 12,
          color: 'bg-blue-500',
          icon: DocumentTextIcon,
        },
        {
          id: 'accept',
          name: 'ตรวจสอบคุณสมบัติ',
          description: 'ตรวจสอบคุณสมบัติและเอกสาร',
          status: 'in_progress',
          count: 10,
          color: 'bg-yellow-500',
          icon: ClockIcon,
        },
        {
          id: 'assign',
          name: 'มอบหมายผู้ตรวจ',
          description: 'มอบหมายเจ้าหน้าที่ผู้ตรวจสอบ',
          status: 'in_progress',
          count: 8,
          color: 'bg-orange-500',
          icon: ClockIcon,
        },
        {
          id: 'approve',
          name: 'อนุมัติลด',
          description: 'อนุมัติการลดการผลิต',
          status: 'pending',
          count: 5,
          color: 'bg-gray-500',
          icon: CheckCircleIcon,
        },
      ],
    },
  ]

  const getServiceDisplayName = (type: string) => {
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

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircleIcon
      case 'in_progress':
        return ClockIcon
      case 'rejected':
        return XCircleIcon
      default:
        return ClockIcon
    }
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const displayFlows = selectedService === 'all' 
    ? mockServiceFlows 
    : mockServiceFlows.filter(flow => flow.serviceType === selectedService)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`${compact ? 'p-4' : 'p-6'} bg-white rounded-lg shadow`}>
      <div className="mb-6">
        <h2 className={`font-bold ${compact ? 'text-lg' : 'text-xl'} text-gray-900 mb-2`}>
          การไหลของบริการ
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          แสดงขั้นตอนและสถานะของคำขอทั้ง 4 ประเภท
        </p>
        
        {!compact && (
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setSelectedService('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selectedService === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ทั้งหมด
            </button>
            {mockServiceFlows.map((flow) => (
              <button
                key={flow.serviceType}
                onClick={() => setSelectedService(flow.serviceType)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  selectedService === flow.serviceType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {getServiceDisplayName(flow.serviceType)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-8">
        {displayFlows.map((flow) => (
          <div key={flow.serviceType} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {getServiceDisplayName(flow.serviceType)}
              </h3>
              <span className="text-sm text-gray-500">
                ทั้งหมด {flow.totalCount} คำขอ
              </span>
            </div>

            <div className="relative">
              {/* Progress line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-300"></div>

              <div className="space-y-4">
                {flow.steps.map((step, index) => {
                  const Icon = getStepIcon(step.status)
                  return (
                    <div key={step.id} className="flex items-start relative">
                      {/* Step circle with icon */}
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${getStepColor(step.status)} bg-white z-10`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      {/* Step content */}
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{step.name}</h4>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStepColor(step.status)}`}>
                              {step.count} คำขอ
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Arrow to next step */}
                      {index < flow.steps.length - 1 && (
                        <div className="ml-4 flex items-center">
                          <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <CheckCircleIcon className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-gray-600">เสร็จสิ้น</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 text-yellow-600 mr-1" />
            <span className="text-gray-600">กำลังดำเนินการ</span>
          </div>
          <div className="flex items-center">
            <XCircleIcon className="w-4 h-4 text-red-600 mr-1" />
            <span className="text-gray-600">ปฏิเสธ</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-gray-600">รอดำเนินการ</span>
          </div>
        </div>
      </div>
    </div>
  )
}