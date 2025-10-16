import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is for admin/officer section (Web Portal)
  if (pathname.startsWith('/eservice/dede/officer') || pathname.startsWith('/admin-portal')) {
    // For middleware protection, we'll rely on client-side authentication
    // since tokens are stored in localStorage
    // The actual authentication check will happen in the layout components
    
    // We could implement server-side token validation here if needed
    // by passing tokens via cookies or headers
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/eservice/dede/officer/:path*', '/admin-portal/:path*', '/web-view/admin-portal/:path*']
}