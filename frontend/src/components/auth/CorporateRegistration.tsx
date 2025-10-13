'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { CorporateRegisterData } from '@/types'
import OTPVerification from './OTPVerification'

interface CorporateRegistrationProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function CorporateRegistration({ onSuccess, onCancel }: CorporateRegistrationProps) {
  const { registerCorporate, verifyCorporateOTP, sendOTP, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [email, setEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CorporateRegisterData>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      fullName: '',
      phone: '',
      corporateName: '',
      corporateNameEn: '',
      registrationNumber: '',
      taxId: '',
      corporateType: '',
      industryType: '',
      address: '',
      province: '',
      district: '',
      subdistrict: '',
      postalCode: '',
      corporatePhone: '',
      corporateEmail: '',
      website: '',
      description: '',
    },
  })

  const onSubmit = async (data: CorporateRegisterData) => {
    setError(null)
    setSuccess(null)
    
    const result = await registerCorporate(data)
    
    if (result.success) {
      setSuccess('ส่งข้อมูลการสมัครนิติบุคคลเรียบร้อยแล้ว')
      setEmail(data.email)
      setShowOTPVerification(true)
    } else {
      setError(result.message || 'ไม่สามารถสมัครนิติบุคคลได้')
    }
  }

  const handleOTPVerified = () => {
    setSuccess('การยืนยัน OTP สำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบ')
    setTimeout(() => {
      onSuccess()
    }, 2000)
  }

  const handleCancelOTP = () => {
    setShowOTPVerification(false)
  }

  if (showOTPVerification) {
    return (
      <div className="max-w-2xl w-full mx-auto">
        <OTPVerification
          identifier={email}
          purpose="corporate_registration"
          onVerified={handleOTPVerified}
          onCancel={handleCancelOTP}
          title="ยืนยันการสมัครนิติบุคคล"
          description="กรุณากรอกรหัส OTP ที่ได้รับทางอีเมลเพื่อยืนยันการสมัครนิติบุคคล"
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">สมัครสมาชิกนิติบุคคล</h2>
        <p className="text-secondary-600">
          กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสมัครบัญชีนิติบุคคล
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-danger-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-danger-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-danger-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-success-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-success-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-success-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* User Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">ข้อมูลผู้ดูแลบัญชี</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-secondary-700">
                ชื่อผู้ใช้ *
              </label>
              <input
                {...register('username', { required: 'กรุณาระบุชื่อผู้ใช้' })}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="ชื่อผู้ใช้"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-danger-600">{errors.username.message as string}</p>
              )}
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-secondary-700">
                ชื่อ-นามสกุล *
              </label>
              <input
                {...register('fullName', { required: 'กรุณาระบุชื่อ-นามสกุล' })}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="ชื่อ-นามสกุล"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-danger-600">{errors.fullName.message as string}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                อีเมล *
              </label>
              <input
                {...register('email', { 
                  required: 'กรุณาระบุอีเมล',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'รูปแบบอีเมลไม่ถูกต้อง'
                  }
                })}
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600">{errors.email.message as string}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-secondary-700">
                เบอร์โทรศัพท์ *
              </label>
              <input
                {...register('phone', { 
                  required: 'กรุณาระบุเบอร์โทรศัพท์',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก'
                  }
                })}
                type="tel"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="08xxxxxxxx"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-danger-600">{errors.phone.message as string}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                รหัสผ่าน *
              </label>
              <input
                {...register('password', { 
                  required: 'กรุณาระบุรหัสผ่าน',
                  minLength: {
                    value: 6,
                    message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
                  }
                })}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="รหัสผ่าน"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-danger-600">{errors.password.message as string}</p>
              )}
            </div>
          </div>
        </div>

        {/* Corporate Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">ข้อมูลนิติบุคคล</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="corporateName" className="block text-sm font-medium text-secondary-700">
                ชื่อนิติบุคคล (ภาษาไทย) *
              </label>
              <input
                {...register('corporateName', { required: 'กรุณาระบุชื่อนิติบุคคล' })}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="ชื่อนิติบุคคล"
              />
              {errors.corporateName && (
                <p className="mt-1 text-sm text-danger-600">{errors.corporateName.message as string}</p>
              )}
            </div>

            <div>
              <label htmlFor="corporateNameEn" className="block text-sm font-medium text-secondary-700">
                ชื่อนิติบุคคล (ภาษาอังกฤษ)
              </label>
              <input
                {...register('corporateNameEn')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Corporate Name"
              />
            </div>

            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-secondary-700">
                เลขทะเบียนนิติบุคคล *
              </label>
              <input
                {...register('registrationNumber', { required: 'กรุณาระบุเลขทะเบียนนิติบุคคล' })}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="เลขทะเบียนนิติบุคคล"
              />
              {errors.registrationNumber && (
                <p className="mt-1 text-sm text-danger-600">{errors.registrationNumber.message as string}</p>
              )}
            </div>

            <div>
              <label htmlFor="taxId" className="block text-sm font-medium text-secondary-700">
                เลขประจำตัวผู้เสียภาษี
              </label>
              <input
                {...register('taxId')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="เลขประจำตัวผู้เสียภาษี"
              />
            </div>

            <div>
              <label htmlFor="corporateType" className="block text-sm font-medium text-secondary-700">
                ประเภทนิติบุคคล *
              </label>
              <select
                {...register('corporateType', { required: 'กรุณาเลือกประเภทนิติบุคคล' })}
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">เลือกประเภท</option>
                <option value="company">บริษัทจำกัด</option>
                <option value="partnership">ห้างหุ้นส่วนจำกัด</option>
                <option value="sole_proprietorship">ห้างหุ้นส่วนสามัญ</option>
                <option value="limited_company">บริษัทจำกัดมหาชน</option>
                <option value="public_company">บริษัทมหาชนจำกัด</option>
                <option value="state_owned">รัฐวิสาหกิจ</option>
              </select>
              {errors.corporateType && (
                <p className="mt-1 text-sm text-danger-600">{errors.corporateType.message as string}</p>
              )}
            </div>

            <div>
              <label htmlFor="industryType" className="block text-sm font-medium text-secondary-700">
                ประเภทอุตสาหกรรม
              </label>
              <input
                {...register('industryType')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="ประเภทอุตสาหกรรม"
              />
            </div>

            <div>
              <label htmlFor="corporatePhone" className="block text-sm font-medium text-secondary-700">
                เบอร์โทรศัพท์บริษัท
              </label>
              <input
                {...register('corporatePhone')}
                type="tel"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="เบอร์โทรศัพท์บริษัท"
              />
            </div>

            <div>
              <label htmlFor="corporateEmail" className="block text-sm font-medium text-secondary-700">
                อีเมลบริษัท
              </label>
              <input
                {...register('corporateEmail', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'รูปแบบอีเมลไม่ถูกต้อง'
                  }
                })}
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="corporate@example.com"
              />
              {errors.corporateEmail && (
                <p className="mt-1 text-sm text-danger-600">{errors.corporateEmail.message as string}</p>
              )}
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-secondary-700">
                เว็บไซต์
              </label>
              <input
                {...register('website')}
                type="url"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="https://www.example.com"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-secondary-700">
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="รายละเอียดเกี่ยวกับบริษัท"
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">ที่อยู่</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-secondary-700">
                ที่อยู่ *
              </label>
              <input
                {...register('address', { required: 'กรุณาระบุที่อยู่' })}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="ที่อยู่"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-danger-600">{errors.address.message as string}</p>
              )}
            </div>

            <div>
              <label htmlFor="province" className="block text-sm font-medium text-secondary-700">
                จังหวัด *
              </label>
              <input
                {...register('province', { required: 'กรุณาระบุจังหวัด' })}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="จังหวัด"
              />
              {errors.province && (
                <p className="mt-1 text-sm text-danger-600">{errors.province.message as string}</p>
              )}
            </div>

            <div>
              <label htmlFor="district" className="block text-sm font-medium text-secondary-700">
                เขต/อำเภอ *
              </label>
              <input
                {...register('district', { required: 'กรุณาระบุเขต/อำเภอ' })}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="เขต/อำเภอ"
              />
              {errors.district && (
                <p className="mt-1 text-sm text-danger-600">{errors.district.message as string}</p>
              )}
            </div>

            <div>
              <label htmlFor="subdistrict" className="block text-sm font-medium text-secondary-700">
                แขวง/ตำบล *
              </label>
              <input
                {...register('subdistrict', { required: 'กรุณาระบุแขวง/ตำบล' })}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="แขวง/ตำบล"
              />
              {errors.subdistrict && (
                <p className="mt-1 text-sm text-danger-600">{errors.subdistrict.message as string}</p>
              )}
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-secondary-700">
                รหัสไปรษณีย์ *
              </label>
              <input
                {...register('postalCode', { 
                  required: 'กรุณาระบุรหัสไปรษณีย์',
                  pattern: {
                    value: /^[0-9]{5}$/,
                    message: 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก'
                  }
                })}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="รหัสไปรษณีย์"
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-danger-600">{errors.postalCode.message as string}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังสมัคร...
              </>
            ) : (
              'สมัครสมาชิกนิติบุคคล'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}