'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '@/hooks/useAuth'
import { RegisterData } from '@/types'

// Validation schema
const registerSchema = yup.object().shape({
  username: yup.string().required('กรุณาระบุชื่อผู้ใช้').min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'),
  email: yup.string().required('กรุณาระบุอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: yup.string().required('กรุณาระบุรหัสผ่าน').min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  confirmPassword: yup.string().required('กรุณายืนยันรหัสผ่าน').oneOf([yup.ref('password')], 'รหัสผ่านไม่ตรงกัน'),
  firstName: yup.string().required('กรุณาระบุชื่อ'),
  lastName: yup.string().required('กรุณาระบุนามสกุล'),
  role: yup.string().required('กรุณาเลือกบทบาท'),
  department: yup.string(),
  position: yup.string(),
  phone: yup.string(),
})

export default function RegisterPage() {
  const { register: registerUser, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: 'user',
      department: '',
      position: '',
      phone: '',
    },
  })

  const selectedRole = watch('role')

  useEffect(() => {
    // Only redirect if not loading and authenticated
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const onSubmit = async (data: RegisterData) => {
    setError(null)
    setIsSubmitting(true)
    
    try {
      const result = await registerUser(data)
      
      if (!result.success) {
        setError(result.message || 'สมัครสมาชิกไม่สำเร็จ')
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            สมัครสมาชิก DEDE E-Service
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            สร้างบัญชีเพื่อเข้าใช้ระบบบริการอิเล็กทรอนิกส์
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-danger-50 p-4">
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
          
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-secondary-900">ข้อมูลส่วนตัว</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-secondary-700">
                  ชื่อ
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="ชื่อ"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-danger-600">{errors.firstName.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-secondary-700">
                  นามสกุล
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="นามสกุล"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-danger-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                อีเมล
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="อีเมล"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-secondary-700">
                เบอร์โทรศัพท์ (ไม่จำเป็น)
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="เบอร์โทรศัพท์"
              />
            </div>
          </div>
          
          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-secondary-900">ข้อมูลการทำงาน</h3>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-secondary-700">
                บทบาท
              </label>
              <select
                {...register('role')}
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="user">ผู้ขอใบอนุญาต</option>
                <option value="inspector">ผู้ตรวจสอบ</option>
                <option value="admin">ผู้ดูแลระบบ</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-danger-600">{errors.role.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-secondary-700">
                แผนก/หน่วยงาน (ไม่จำเป็น)
              </label>
              <input
                {...register('department')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="แผนก/หน่วยงาน"
              />
            </div>
            
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-secondary-700">
                ตำแหน่ง (ไม่จำเป็น)
              </label>
              <input
                {...register('position')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="ตำแหน่ง"
              />
            </div>
          </div>
          
          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-secondary-900">ข้อมูลบัญชี</h3>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-secondary-700">
                ชื่อผู้ใช้
              </label>
              <input
                {...register('username')}
                type="text"
                autoComplete="username"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="ชื่อผู้ใช้"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-danger-600">{errors.username.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                รหัสผ่าน
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="รหัสผ่าน"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                ยืนยันรหัสผ่าน
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                autoComplete="new-password"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="ยืนยันรหัสผ่าน"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-danger-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting || isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังสมัครสมาชิก...
                </>
              ) : (
                'สมัครสมาชิก'
              )}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-secondary-600">
              มีบัญชีอยู่แล้ว?{' '}
              <a href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                เข้าสู่ระบบ
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}