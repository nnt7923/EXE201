import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for undefined routes in itineraries
  if (pathname.includes('/itineraries/undefined')) {
    return NextResponse.redirect(new URL('/itineraries', request.url));
  }

  // Check for other invalid routes
  if (pathname.match(/\/itineraries\/[^\/]*undefined[^\/]*$/)) {
    return NextResponse.redirect(new URL('/itineraries', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};