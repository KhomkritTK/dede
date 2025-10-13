'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ServicesPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const services = [
    {
      id: 1,
      title: 'คำขอใบอนุญาตผลิตไฟฟ้าจากพลังงานทดแทน',
      description: 'ยื่นคำขอใบอนุญาตสำหรับการติดตั้งและดำเนินการโรงไฟฟ้าพลังงานทดแทน',
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      link: '/login'
    },
    {
      id: 2,
      title: 'คำขอใบอนุญาตสนับสนุนโครงการพลังงานทดแทน',
      description: 'ยื่นคำขอสนับสนุนสำหรับโครงการพลังงานทดแทนขนาดเล็กและขนาดกลาง',
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: '/login'
    },
    {
      id: 3,
      title: 'ติดตามสถานะคำขอ',
      description: 'ติดตามสถานะคำขอและการดำเนินการต่างๆ แบบ real-time',
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      link: '/login'
    },
    {
      id: 4,
      title: 'ดาวน์โหลดเอกสารและคู่มือ',
      description: 'ดาวน์โหลดเอกสาร คู่มือ และแบบฟอร์มที่เกี่ยวข้องกับพลังงานทดแทน',
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      link: '#'
    },
    {
      id: 5,
      title: 'นัดหมายเจ้าหน้าที่ตรวจสอบ',
      description: 'นัดหมายเจ้าหน้าที่เพื่อตรวจสอบสถานที่ติดตั้งพลังงานทดแทน',
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      link: '/login'
    },
    {
      id: 6,
      title: 'ติดต่อเจ้าหน้าที่',
      description: 'ติดต่อเจ้าหน้าที่เพื่อขอคำปรึกษาและข้อมูลเพิ่มเติม',
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: '/eservice/dede/contact'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/eservice/dede" className="flex items-center">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">DE</span>
                  </div>
                  <h1 className="ml-3 text-xl font-semibold text-gray-900">DEDE E-Service</h1>
                </Link>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/eservice/dede/home" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  หน้าแรก
                </Link>
                <Link href="/eservice/dede/services" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  บริการ
                </Link>
                <Link href="/eservice/dede/about" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  เกี่ยวกับเรา
                </Link>
                <Link href="/eservice/dede/contact" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  ติดต่อเรา
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <Link href="/login" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                  สมัครสมาชิก
                </Link>
              </div>
              <div className="sm:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {!isMenuOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link href="/eservice/dede/home" className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                หน้าแรก
              </Link>
              <Link href="/eservice/dede/services" className="bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                บริการ
              </Link>
              <Link href="/eservice/dede/about" className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                เกี่ยวกับเรา
              </Link>
              <Link href="/eservice/dede/contact" className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                ติดต่อเรา
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Link href="/login" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                    เข้าสู่ระบบ
                  </Link>
                </div>
                <div className="ml-3">
                  <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                    สมัครสมาชิก
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="relative bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl">
              บริการของเรา
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
              บริการครบวงจรสำหรับการขออนุญาตและจัดการพลังงานทดแทน
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg text-white mb-4">
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-500 mb-4">{service.description}</p>
                  <div className="mt-4">
                    <Link
                      href={service.link}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      ใช้บริการ
                      <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">ขั้นตอนการใช้บริการ</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              ง่ายๆ เพียงไม่กี่ขั้นตอน
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              ทำตามขั้นตอนง่ายๆ เพื่อเริ่มต้นใช้บริการของเรา
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white mx-auto mb-4">
                  <span className="text-lg font-bold">1</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">สมัครสมาชิก</h3>
                <p className="mt-2 text-base text-gray-500">
                  สมัครสมาชิกเพื่อเข้าใช้งานระบบ
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white mx-auto mb-4">
                  <span className="text-lg font-bold">2</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">เลือกบริการ</h3>
                <p className="mt-2 text-base text-gray-500">
                  เลือกบริการที่ต้องการใช้งาน
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white mx-auto mb-4">
                  <span className="text-lg font-bold">3</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">ยื่นคำขอ</h3>
                <p className="mt-2 text-base text-gray-500">
                  กรอกข้อมูลและยื่นคำขอออนไลน์
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white mx-auto mb-4">
                  <span className="text-lg font-bold">4</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">ติดตามผล</h3>
                <p className="mt-2 text-base text-gray-500">
                  ติดตามสถานะคำขอและรับผลลัพธ์
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">พร้อมที่จะเริ่มต้นใช้งานหรือยัง?</span>
            <span className="block text-blue-600">สมัครสมาชิกวันนี้เพื่อเข้าใช้บริการ</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                สมัครสมาชิก
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/eservice/dede/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                ติดต่อเรา
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">DE</span>
                  </div>
                </div>
                <h3 className="ml-3 text-xl font-semibold text-white">DEDE E-Service</h3>
              </div>
              <p className="text-gray-300 text-base">
                ระบบบริการอิเล็กทรอนิกส์ กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    บริการ
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link href="/eservice/dede/services" className="text-base text-gray-300 hover:text-white">
                        คำขอใบอนุญาต
                      </Link>
                    </li>
                    <li>
                      <Link href="/eservice/dede/services" className="text-base text-gray-300 hover:text-white">
                        ติดตามสถานะ
                      </Link>
                    </li>
                    <li>
                      <Link href="/eservice/dede/services" className="text-base text-gray-300 hover:text-white">
                        ดาวน์โหลดเอกสาร
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    ข้อมูล
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link href="/eservice/dede/about" className="text-base text-gray-300 hover:text-white">
                        เกี่ยวกับเรา
                      </Link>
                    </li>
                    <li>
                      <Link href="/eservice/dede/contact" className="text-base text-gray-300 hover:text-white">
                        ติดต่อเรา
                      </Link>
                    </li>
                    <li>
                      <Link href="/login" className="text-base text-gray-300 hover:text-white">
                        เข้าสู่ระบบ
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; 2023 กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน. สงวนลิขสิทธิ์.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}