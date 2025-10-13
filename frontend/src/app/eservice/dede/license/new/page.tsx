'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import PublicLayout from '@/components/layout/PublicLayout'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// Validation schema
const newLicenseSchema = yup.object().shape({
  licenseType: yup.string().required('กรุณาเลือกประเภทใบอนุญาต'),
  projectName: yup.string().required('กรุณาระบุชื่อโครงการ'),
  projectAddress: yup.string().required('กรุณาระบุที่อยู่โครงการ'),
  province: yup.string().required('กรุณาเลือกจังหวัด'),
  district: yup.string().required('กรุณาระบุอำเภอ/เขต'),
  subdistrict: yup.string().required('กรุณาระบุตำบล/แขวง'),
  postalCode: yup.string().required('กรุณาระบุรหัสไปรษณีย์'),
  energyType: yup.string().required('กรุณาเลือกประเภทพลังงาน'),
  capacity: yup.string().required('กรุณาระบุกำลังการผลิต'),
  capacityUnit: yup.string().required('กรุณาเลือกหน่วยกำลังการผลิต'),
  expectedStartDate: yup.string().required('กรุณาระบุวันที่คาดว่าจะเริ่มผลิต'),
  contactPerson: yup.string().required('กรุณาระบุชื่อผู้ติดต่อ'),
  contactPhone: yup.string().required('กรุณาระบุเบอร์โทรศัพท์ผู้ติดต่อ'),
  contactEmail: yup.string().required('กรุณาระบุอีเมลผู้ติดต่อ').email('รูปแบบอีเมลไม่ถูกต้อง'),
  description: yup.string().required('กรุณาระบุรายละเอียดโครงการ'),
})

interface NewLicenseFormData {
  licenseType: string
  projectName: string
  projectAddress: string
  province: string
  district: string
  subdistrict: string
  postalCode: string
  energyType: string
  capacity: string
  capacityUnit: string
  expectedStartDate: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  description: string
}

export default function NewLicensePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<NewLicenseFormData>({
    resolver: yupResolver(newLicenseSchema),
    defaultValues: {
      licenseType: '',
      projectName: '',
      projectAddress: '',
      province: '',
      district: '',
      subdistrict: '',
      postalCode: '',
      energyType: '',
      capacity: '',
      capacityUnit: 'MW',
      expectedStartDate: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: user?.email || '',
      description: '',
    },
  })

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
  }, [isAuthenticated, isLoading, router])

  const onSubmit = async (data: NewLicenseFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In a real application, you would make an API call here
      console.log('Submitting new license request:', data)
      
      setSubmitSuccess(true)
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการส่งคำขอ')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !isAuthenticated) {
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
              คำขอใบอนุญาตของคุณได้รับการบันทึกเรียบร้อยแล้ว
              เจ้าหน้าที่จะตรวจสอบและดำเนินการต่อ
            </p>
            <p className="mt-1 text-sm text-gray-500">
              หมายเลขคำขอ: REQ-2023-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => router.push('/eservice/dede/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                กลับสู่แดชบอร์ด
              </button>
              <button
                onClick={() => router.push('/eservice/dede/license/new')}
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
          <h1 className="text-3xl font-bold text-gray-900">ขอรับใบอนุญาตใหม่</h1>
          <p className="mt-2 text-gray-600">
            กรอกข้อมูลเพื่อยื่นคำขอรับใบอนุญาตสำหรับการติดตั้งและดำเนินการโครงการพลังงานทดแทน
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Project Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลโครงการ</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700">
                  ประเภทใบอนุญาต <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('licenseType')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">เลือกประเภทใบอนุญาต</option>
                  <option value="solar">โรงไฟฟ้าพลังงานแสงอาทิตย์</option>
                  <option value="wind">โรงไฟฟ้าพลังงานลม</option>
                  <option value="biomass">โรงไฟฟ้าพลังงานชีวมวล</option>
                  <option value="hydro">โรงไฟฟ้าพลังงานน้ำ</option>
                  <option value="waste">โรงไฟฟ้าจากขยะมูลฝอย</option>
                </select>
                {errors.licenseType && (
                  <p className="mt-1 text-sm text-red-600">{errors.licenseType.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                  ชื่อโครงการ <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('projectName')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="ชื่อโครงการ"
                />
                {errors.projectName && (
                  <p className="mt-1 text-sm text-red-600">{errors.projectName.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="projectAddress" className="block text-sm font-medium text-gray-700">
                ที่อยู่โครงการ <span className="text-red-500">*</span>
              </label>
              <input
                {...register('projectAddress')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ที่อยู่โครงการ"
              />
              {errors.projectAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.projectAddress.message}</p>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                  จังหวัด <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('province')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">เลือกจังหวัด</option>
                  <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                  <option value="นนทบุรี">นนทบุรี</option>
                  <option value="ปทุมธานี">ปทุมธานี</option>
                  <option value="สมุทรปราการ">สมุทรปราการ</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
                {errors.province && (
                  <p className="mt-1 text-sm text-red-600">{errors.province.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                  อำเภอ/เขต <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('district')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="อำเภอ/เขต"
                />
                {errors.district && (
                  <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="subdistrict" className="block text-sm font-medium text-gray-700">
                  ตำบล/แขวง <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('subdistrict')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="ตำบล/แขวง"
                />
                {errors.subdistrict && (
                  <p className="mt-1 text-sm text-red-600">{errors.subdistrict.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  รหัสไปรษณีย์ <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('postalCode')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="รหัสไปรษณีย์"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Technical Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลทางเทคนิค</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="energyType" className="block text-sm font-medium text-gray-700">
                  ประเภทพลังงาน <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('energyType')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">เลือกประเภทพลังงาน</option>
                  <option value="solar">พลังงานแสงอาทิตย์</option>
                  <option value="wind">พลังงานลม</option>
                  <option value="biomass">พลังงานชีวมวล</option>
                  <option value="hydro">พลังงานน้ำ</option>
                  <option value="waste">พลังงานขยะมูลฝอย</option>
                </select>
                {errors.energyType && (
                  <p className="mt-1 text-sm text-red-600">{errors.energyType.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                  กำลังการผลิต <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    {...register('capacity')}
                    type="text"
                    className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="กำลังการผลิต"
                  />
                  <select
                    {...register('capacityUnit')}
                    className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm"
                  >
                    <option value="MW">MW</option>
                    <option value="kW">kW</option>
                    <option value="MWp">MWp</option>
                    <option value="kWp">kWp</option>
                  </select>
                </div>
                {errors.capacity && (
                  <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="expectedStartDate" className="block text-sm font-medium text-gray-700">
                  วันที่คาดว่าจะเริ่มผลิต <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('expectedStartDate')}
                  type="date"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.expectedStartDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.expectedStartDate.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                รายละเอียดโครงการ <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="กรุณาระบุรายละเอียดโครงการ"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลผู้ติดต่อ</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                  ชื่อผู้ติดต่อ <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('contactPerson')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="ชื่อผู้ติดต่อ"
                />
                {errors.contactPerson && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPerson.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                  เบอร์โทรศัพท์ผู้ติดต่อ <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('contactPhone')}
                  type="tel"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="เบอร์โทรศัพท์"
                />
                {errors.contactPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                  อีเมลผู้ติดต่อ <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('contactEmail')}
                  type="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="อีเมล"
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/eservice/dede/dashboard')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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