import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Check if user session is expired
    if (req.nextauth.token?.isExpired) {
      console.log("🕐 Session expired, redirecting to sign-in");
      // Redirect to sign-in page with callbackUrl
      return NextResponse.redirect(
        new URL(
          `/auth/signin?callbackUrl=${encodeURIComponent(req.url)}`,
          req.url
        )
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token && !token.isExpired,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - api/health (health check endpoint)
     * - api/public (public API endpoints)
     * - auth (authentication pages)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - site.webmanifest (PWA manifest)
     */
    "/((?!api/auth|api/health|api/public|auth|_next/static|_next/image|favicon.ico|site.webmanifest).*)",
  ],
};
