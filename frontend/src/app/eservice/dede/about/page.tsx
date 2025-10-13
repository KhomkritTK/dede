'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function AboutPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
                <Link href="/eservice/dede/services" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  บริการ
                </Link>
                <Link href="/eservice/dede/about" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
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
              <Link href="/eservice/dede/services" className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                บริการ
              </Link>
              <Link href="/eservice/dede/about" className="bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
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
              เกี่ยวกับเรา
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
              กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน
            </p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">ภารกิจของเรา</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              ส่งเสริมและสนับสนุนการใช้พลังงานทดแทน
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงานมีภารกิจในการส่งเสริมและสนับสนุนการใช้พลังงานทดแทน
              เพื่อลดการพึ่งพาเชื้อเพลิงฟอสซิลและลดการปล่อยก๊าซเรือนกระจก
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">ส่งเสริมพลังงานทดแทน</h3>
                    <p className="mt-5 text-base text-gray-500">
                      ส่งเสริมการใช้พลังงานทดแทนที่หลากหลาย เช่น พลังงานแสงอาทิตย์ พลังงานลม พลังงานชีวมวล
                      และพลังงานน้ำ เพื่อลดการพึ่งพาเชื้อเพลิงฟอสซิล
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">กำกับและตรวจสอบ</h3>
                    <p className="mt-5 text-base text-gray-500">
                      กำกับดูแลและตรวจสอบการติดตั้งและใช้งานพลังงานทดแทน
                      เพื่อให้เป็นไปตามมาตรฐานและกฎหมายที่เกี่ยวข้อง
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">ให้ความรู้และข้อมูล</h3>
                    <p className="mt-5 text-base text-gray-500">
                      ให้ความรู้และข้อมูลเกี่ยวกับพลังงานทดแทนแก่ประชาชนและภาคเอกชน
                      เพื่อส่งเสริมการใช้พลังงานทดแทนอย่างแพร่หลาย
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                วิสัยทัศน์ของเรา
              </h2>
              <p className="mt-4 text-gray-500">
                "เพื่อเป็นองค์กรหลักในการขับเคลื่อนและส่งเสริมการใช้พลังงานทดแทนและอนุรักษ์พลังงาน
                เพื่อความมั่นคงด้านพลังงานของประเทศและการพัฒนาที่ยั่งยืน"
              </p>
              <p className="mt-4 text-gray-500">
                กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงานมุ่งมั่นที่จะส่งเสริมการใช้พลังงานทดแทน
                ให้เป็นสัดส่วนที่สำคัญในโครงสร้างพลังงานของประเทศ โดยมีเป้าหมายที่ชัดเจนและสอดคล้องกับนโยบายของรัฐบาล
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:mt-0 lg:grid-cols-2">
              <div className="text-center">
                <div className="text-4xl font-extrabold text-blue-600">30%</div>
                <p className="mt-2 text-lg leading-6 font-medium text-gray-900">เป้าหมายพลังงานทดแทน</p>
                <p className="mt-2 text-base text-gray-500">ภายในปี 2570</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-extrabold text-blue-600">20%</div>
                <p className="mt-2 text-lg leading-6 font-medium text-gray-900">ลดการปล่อยก๊าซเรือนกระจก</p>
                <p className="mt-2 text-base text-gray-500">จากภาคพลังงาน</p>
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