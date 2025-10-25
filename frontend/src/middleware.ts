import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const url = request.nextUrl.clone()

  // Check if the path is for admin/officer section (Web Portal)
  if (pathname.startsWith('/eservice/dede/officer') || pathname.startsWith('/admin-portal')) {
    // For middleware protection, we'll rely on client-side authentication
    // since tokens are stored in localStorage
    // The actual authentication check will happen in the layout components
    
    // We could implement server-side token validation here if needed
    // by passing tokens via cookies or headers
  }

  // Handle login success redirects
  // If user just logged in (coming from login page)
  const loginSuccess = searchParams.get('login_success')
  if (loginSuccess === 'true' && pathname === '/') {
    // Redirect to eservice home page after successful login
    url.pathname = '/eservice/dede/home'
    // Remove the login_success parameter
    searchParams.delete('login_success')
    url.search = searchParams.toString()
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/eservice/dede/officer/:path*', '/admin-portal/:path*', '/web-view/admin-portal/:path*', '/']
}