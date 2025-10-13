import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is for admin/officer section (Web Portal)
  if (pathname.startsWith('/eservice/dede/officer')) {
    // Get the token from the cookies
    const token = request.cookies.get('token')?.value

    // If no token, redirect to officer login page
    if (!token) {
      return NextResponse.redirect(new URL('/login-portal', request.url))
    }

    // For now, we'll just check if token exists
    // In a real application, you would verify the token and check the user role
    // You might need to make an API call to validate the token and get user info
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/eservice/dede/officer/:path*']
}