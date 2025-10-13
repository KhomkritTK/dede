'use client'

import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'

export default function EserviceHomePage() {
  return (
    <PublicLayout>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-800 via-blue-700 to-green-600 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6">
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
                    <span className="block">ระบบบริการอิเล็กทรอนิกส์</span>
                    <span className="block text-green-100 mt-2">กรมพัฒนาพลังงานทดแทน</span>
                    <span className="block text-green-100">และอนุรักษ์พลังงาน</span>
                  </h1>
                  <p className="mt-6 text-lg sm:text-xl text-green-50 max-w-2xl mx-auto lg:mx-0">
                    ยื่นคำขอใบอนุญาต ติดตามสถานะ และจัดการเอกสารที่เกี่ยวข้องกับพลังงานทดแทนออนไลน์ได้อย่างสะดวก
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-xl transform transition-all duration-200 hover:scale-105"
                    >
                      เริ่มต้นใช้งาน
                      <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    <Link
                      href="/eservice/dede/services"
                      className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl transform transition-all duration-200 hover:scale-105"
                    >
                      ดูบริการ
                      <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6 mt-12 lg:mt-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl transform rotate-3 opacity-20"></div>
                  <div className="relative bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-xl"
                        src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                        alt="Renewable energy solar panels"
                      />
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">100%</div>
                        <div className="text-sm text-green-100">พลังงานสะอาด</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">24/7</div>
                        <div className="text-sm text-green-100">บริการออนไลน์</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">4</div>
                        <div className="text-sm text-green-100">บริการหลัก</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Services Section */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase font-sans">บริการหลัก</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl font-sans">
              บริการสำหรับใบอนุญาตพลังงานทดแทน
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto font-sans">
              บริการหลักสำหรับการจัดการใบอนุญาตพลังงานทดแทน
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="h-3 bg-gradient-to-r from-green-500 to-green-600"></div>
                <div className="p-6">
                  <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white mb-6 mx-auto shadow-lg">
                    <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center font-sans">ขอรับใบอนุญาตใหม่</h3>
                  <p className="text-gray-600 mb-6 text-center font-sans">
                    ยื่นคำขอรับใบอนุญาตสำหรับการติดตั้งและดำเนินการโรงไฟฟ้าพลังงานทดแทน
                  </p>
                  <div className="text-center">
                    <Link
                      href="/eservice/dede/license/new"
                      className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-md"
                    >
                      ใช้บริการ
                      <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="h-3 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <div className="p-6">
                  <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white mb-6 mx-auto shadow-lg">
                    <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center font-sans">ขอต่ออายุใบอนุญาต</h3>
                  <p className="text-gray-600 mb-6 text-center font-sans">
                    ยื่นคำขอต่ออายุใบอนุญาตสำหรับโครงการพลังงานทดแทนที่มีอยู่แล้ว
                  </p>
                  <div className="text-center">
                    <Link
                      href="/eservice/dede/license/renewal"
                      className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md"
                    >
                      ใช้บริการ
                      <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="h-3 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
                <div className="p-6">
                  <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl text-white mb-6 mx-auto shadow-lg">
                    <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center font-sans">ขอขยายการผลิต</h3>
                  <p className="text-gray-600 mb-6 text-center font-sans">
                    ยื่นคำขอขยายกำลังการผลิตสำหรับโครงการพลังงานทดแทนที่มีอยู่แล้ว
                  </p>
                  <div className="text-center">
                    <Link
                      href="/eservice/dede/license/extension"
                      className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200 shadow-md"
                    >
                      ใช้บริการ
                      <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="h-3 bg-gradient-to-r from-red-500 to-red-600"></div>
                <div className="p-6">
                  <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white mb-6 mx-auto shadow-lg">
                    <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center font-sans">ขอลดการผลิต</h3>
                  <p className="text-gray-600 mb-6 text-center font-sans">
                    ยื่นคำขอลดกำลังการผลิตสำหรับโครงการพลังงานทดแทนที่มีอยู่แล้ว
                  </p>
                  <div className="text-center">
                    <Link
                      href="/eservice/dede/license/reduction"
                      className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-md"
                    >
                      ใช้บริการ
                      <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl font-sans">
            <span className="block">พร้อมที่จะเริ่มต้นใช้งานหรือยัง?</span>
            <span className="block text-green-600">สมัครสมาชิกวันนี้เพื่อเข้าใช้บริการ</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow-lg">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200"
              >
                สมัครสมาชิก
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow-lg">
              <Link
                href="/eservice/dede/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                ติดต่อเรา
              </Link>
            </div>
          </div>
        </div>
      </div>

    </PublicLayout>
  )
}