'use client'

import ServiceFlowVisualization from '@/components/admin/ServiceFlowVisualization'

export default function AdminFlowPage() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            ติดตามการดำเนินการบริการ
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            แสดงขั้นตอนและสถานะของคำขอทั้ง 4 ประเภทจาก Web View
          </p>
        </div>

        <ServiceFlowVisualization />
      </div>
    </div>
  )
}