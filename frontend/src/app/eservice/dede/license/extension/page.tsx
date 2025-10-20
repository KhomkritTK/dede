'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { usePortalAuth } from '@/hooks/usePortalAuth'
import PublicLayout from '@/components/layout/PublicLayout'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { licenseApi, ExtensionLicenseRequest } from '@/lib/license-api'

// Validation schema
const extensionSchema = yup.object().shape({
  licenseType: yup.string().required('กรุณาเลือกประเภทใบอนุญาต'),
  licenseNumber: yup.string().required('กรุณาระบุเลขที่ใบอนุญาต'),
  projectName: yup.string().required('กรุณาระบุชื่อโครงการ'),
  currentCapacity: yup.string().required('กรุณาระบุกำลังการผลิตปัจจุบัน'),
  currentCapacityUnit: yup.string().required('กรุณาเลือกหน่วยกำลังการผลิต'),
  requestedCapacity: yup.string().required('กรุณาระบุกำลังการผลิตที่ขอ'),
  requestedCapacityUnit: yup.string().required('กรุณาเลือกหน่วยกำลังการผลิต'),
  extensionReason: yup.string().required('กรุณาเลือกเหตุผลในการขอขยายการผลิต'),
  expectedStartDate: yup.string().required('กรุณาระบุวันที่คาดว่าจะเริ่มผลิต'),
  contactPerson: yup.string().required('กรุณาระบุชื่อผู้ติดต่อ'),
  contactPhone: yup.string().required('กรุณาระบุเบอร์โทรศัพท์ผู้ติดต่อ'),
  contactEmail: yup.string().required('กรุณาระบุอีเมลผู้ติดต่อ').email('รูปแบบอีเมลไม่ถูกต้อง'),
  description: yup.string().required('กรุณาระบุรายละเอียดการขอขยายการผลิต'),
})

interface ExtensionFormData {
  licenseType: string
  licenseNumber: string
  projectName: string
  currentCapacity: string
  currentCapacityUnit: string
  requestedCapacity: string
  requestedCapacityUnit: string
  extensionReason: string
  expectedStartDate: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  description: string
}

export default function ProductionExtensionPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { user: portalUser, isAuthenticated: isPortalAuth, isLoading: isPortalLoading } = usePortalAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ExtensionFormData>({
    resolver: yupResolver(extensionSchema),
    defaultValues: {
      licenseType: 'expand',
      licenseNumber: '',
      projectName: '',
      currentCapacity: '',
      currentCapacityUnit: 'MW',
      requestedCapacity: '',
      requestedCapacityUnit: 'MW',
      extensionReason: '',
      expectedStartDate: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: (user || portalUser)?.email || '',
      description: '',
    },
  })

  useEffect(() => {
    // Redirect if not authenticated (check both auth systems)
    const isLoaded = !isLoading && !isPortalLoading
    const hasAuth = isAuthenticated || isPortalAuth
    
    if (isLoaded && !hasAuth) {
      router.push('/?redirect=eservice/dede/license/extension')
      return
    }
  }, [isAuthenticated, isPortalAuth, isLoading, isPortalLoading, router])

  const onSubmit = async (data: ExtensionFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Prepare data for API
      const requestData: ExtensionLicenseRequest = {
        licenseType: data.licenseType,
        licenseNumber: data.licenseNumber,
        projectName: data.projectName,
        currentCapacity: data.currentCapacity,
        currentCapacityUnit: data.currentCapacityUnit,
        requestedCapacity: data.requestedCapacity,
        requestedCapacityUnit: data.requestedCapacityUnit,
        extensionReason: data.extensionReason,
        expectedStartDate: data.expectedStartDate,
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        description: data.description
      }
      
      // Make API call
      const response = await licenseApi.createExtensionLicenseRequest(requestData)
      
      if (response.success) {
        setSubmitSuccess(true)
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการส่งคำขอ')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการส่งคำขอ')
    } finally {
      setIsSubmitting(false)
    }
  }

  if ((isLoading || !isAuthenticated) && (isPortalLoading || !isPortalAuth)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (submitSuccess) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="flex justify-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">ส่งคำขอสำเร็จ</h2>
            <p className="mt-2 text-gray-600">
              คำขอขยายการผลิตของคุณได้รับการบันทึกเรียบร้อยแล้ว
              เจ้าหน้าที่จะตรวจสอบและดำเนินการต่อ
            </p>
            <p className="mt-1 text-sm text-gray-500">
              หมายเลขคำขอ: REQ-2023-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => router.push('/eservice/dede/home')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                กลับสู่หน้าแรก
              </button>
              <button
                onClick={() => router.push('/eservice/dede/license/extension')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                สร้างคำขอใหม่
              </button>
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ขอขยายการผลิต</h1>
          <p className="mt-2 text-gray-600">
            กรอกข้อมูลเพื่อยื่นคำขอขยายกำลังการผลิตสำหรับโครงการพลังงานทดแทนของคุณ
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* License Information */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">ข้อมูลใบอนุญาต</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                  เลขที่ใบอนุญาต <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('licenseNumber')}
                  type="text"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="เลขที่ใบอนุญาต"
                />
                {errors.licenseNumber && (
                  <div className="mt-2 flex items-start">
                    <svg className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-red-600">{errors.licenseNumber.message}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="projectName" className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่อโครงการ <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('projectName')}
                  type="text"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="ชื่อโครงการ"
                />
                {errors.projectName && (
                  <div className="mt-2 flex items-start">
                    <svg className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-red-600">{errors.projectName.message}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="currentCapacity" className="block text-sm font-semibold text-gray-700 mb-2">
                  กำลังการผลิตปัจจุบัน <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex rounded-lg shadow-sm">
                  <input
                    {...register('currentCapacity')}
                    type="text"
                    className="flex-1 block w-full px-4 py-3 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="กำลังการผลิต"
                  />
                  <select
                    {...register('currentCapacityUnit')}
                    className="inline-flex items-center px-4 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 text-gray-700 sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="MW">MW</option>
                    <option value="kW">kW</option>
                    <option value="MWp">MWp</option>
                    <option value="kWp">kWp</option>
                  </select>
                </div>
                {errors.currentCapacity && (
                  <div className="mt-2 flex items-start">
                    <svg className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-red-600">{errors.currentCapacity.message}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="requestedCapacity" className="block text-sm font-semibold text-gray-700 mb-2">
                  กำลังการผลิตที่ขอ <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex rounded-lg shadow-sm">
                  <input
                    {...register('requestedCapacity')}
                    type="text"
                    className="flex-1 block w-full px-4 py-3 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="กำลังการผลิตที่ขอ"
                  />
                  <select
                    {...register('requestedCapacityUnit')}
                    className="inline-flex items-center px-4 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 text-gray-700 sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="MW">MW</option>
                    <option value="kW">kW</option>
                    <option value="MWp">MWp</option>
                    <option value="kWp">kWp</option>
                  </select>
                </div>
                {errors.requestedCapacity && (
                  <div className="mt-2 flex items-start">
                    <svg className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-red-600">{errors.requestedCapacity.message}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="extensionReason" className="block text-sm font-semibold text-gray-700 mb-2">
                เหตุผลในการขอขยายการผลิต <span className="text-red-500">*</span>
              </label>
              <select
                {...register('extensionReason')}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base transition-colors duration-200 text-gray-900"
              >
                <option value="">เลือกเหตุผลในการขอขยายการผลิต</option>
                <option value="demand_increase">ความต้องการพลังงานเพิ่มขึ้น</option>
                <option value="technology_upgrade">อัพเกรดเทคโนโลยีที่มีประสิทธิภาพสูงขึ้น</option>
                <option value="expansion">การขยายธุรกิจ</option>
                <option value="other">อื่นๆ</option>
              </select>
              {errors.extensionReason && (
                <div className="mt-2 flex items-start">
                  <svg className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-red-600">{errors.extensionReason.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Extension Details */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">รายละเอียดการขอขยาย</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="expectedStartDate" className="block text-sm font-semibold text-gray-700 mb-2">
                  วันที่คาดว่าจะเริ่มผลิต (กำลังการผลิตที่เพิ่มขึ้น) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('expectedStartDate')}
                  type="date"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base transition-colors duration-200 text-gray-900"
                />
                {errors.expectedStartDate && (
                  <div className="mt-2 flex items-start">
                    <svg className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-red-600">{errors.expectedStartDate.message}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                รายละเอียดการขอขยายการผลิต <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base transition-colors duration-200 text-gray-900 placeholder-gray-500"
                placeholder="กรุณาระบุรายละเอียดการขอขยายการผลิต"
              />
              {errors.description && (
                <div className="mt-2 flex items-start">
                  <svg className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-red-600">{errors.description.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">ข้อมูลผู้ติดต่อ</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="contactPerson" className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่อผู้ติดต่อ <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('contactPerson')}
                  type="text"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="ชื่อผู้ติดต่อ"
                />
                {errors.contactPerson && (
                  <div className="mt-2 flex items-start">
                    <svg className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-red-600">{errors.contactPerson.message}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-semibold text-gray-700 mb-2">
                  เบอร์โทรศัพท์ผู้ติดต่อ <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('contactPhone')}
                  type="tel"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="เบอร์โทรศัพท์"
                />
                {errors.contactPhone && (
                  <div className="mt-2 flex items-start">
                    <svg className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-red-600">{errors.contactPhone.message}</p>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="contactEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                  อีเมลผู้ติดต่อ <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('contactEmail')}
                  type="email"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base transition-colors duration-200"
                  placeholder="อีเมล"
                />
                {errors.contactEmail && (
                  <div className="mt-2 flex items-start">
                    <svg className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-red-600">{errors.contactEmail.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/eservice/dede/home')}
              className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังส่งคำขอ...
                </>
              ) : (
                'ส่งคำขอ'
              )}
            </button>
          </div>
        </form>
      </div>
    </PublicLayout>
  )
}