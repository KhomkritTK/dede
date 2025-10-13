'use client'

import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'

export default function EserviceHomePage() {
  return (
    <PublicLayout>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 to-green-600 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-gradient-to-r from-blue-700 to-green-600 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl font-sans">
                  <span className="block xl:inline">ระบบบริการอิเล็กทรอนิกส์</span>{' '}
                  <span className="block text-green-100 xl:inline">กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน</span>
                </h1>
                <p className="mt-3 text-base text-green-50 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 font-sans">
                  ยื่นคำขอใบอนุญาต ติดตามสถานะ และจัดการเอกสารที่เกี่ยวข้องกับพลังงานทดแทนออนไลน์ได้อย่างสะดวก
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow-lg">
                    <Link
                      href="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-500 hover:bg-green-400 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                    >
                      เริ่มต้นใช้งาน
                    </Link>
                  </div>
                  <div className="mt-3 rounded-md shadow-lg sm:mt-0 sm:ml-3">
                    <Link
                      href="/eservice/dede/services"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-400 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                    >
                      ดูบริการ
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1473341304470-748de4350e11?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
            alt="Renewable energy"
          />
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

      {/* Services Section */}
      <div className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase font-sans">บริการอื่นๆ</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl font-sans">
              บริการเสริมสำหรับพลังงานทดแทน
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto font-sans">
              บริการเสริมที่ช่วยให้การจัดการพลังงานทดแทนเป็นไปอย่างสะดวก
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-8">
              <div className="relative bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-semibold text-gray-900 font-sans">ติดตามสถานะ</p>
                <p className="mt-2 ml-16 text-base text-gray-600 font-sans">
                  ติดตามสถานะคำขอและการดำเนินการต่างๆ แบบ real-time
                </p>
              </div>

              <div className="relative bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-semibold text-gray-900 font-sans">คู่มือและเอกสาร</p>
                <p className="mt-2 ml-16 text-base text-gray-600 font-sans">
                  ดาวน์โหลดเอกสารและคู่มือที่เกี่ยวข้องกับพลังงานทดแทน
                </p>
              </div>

              <div className="relative bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-semibold text-gray-900 font-sans">ศูนย์ช่วยเหลือ</p>
                <p className="mt-2 ml-16 text-base text-gray-600 font-sans">
                  คำถามที่พบบ่อยและช่องทางการติดต่อเจ้าหน้าที่
                </p>
              </div>

              <div className="relative bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-semibold text-gray-900 font-sans">ข้อมูลข่าวสาร</p>
                <p className="mt-2 ml-16 text-base text-gray-600 font-sans">
                  ข่าวประกาศและข้อมูลล่าสุดเกี่ยวกับพลังงานทดแทน
                </p>
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