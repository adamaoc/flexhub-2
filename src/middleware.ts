import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware() {
    // Add custom logic here if needed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - api/health (health check endpoint)
     * - auth (authentication pages)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - site.webmanifest (PWA manifest)
     */
    '/((?!api/auth|api/health|auth|_next/static|_next/image|favicon.ico|site.webmanifest).*)',
  ],
} 