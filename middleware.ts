import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Cache headers for static assets
  if (request.nextUrl.pathname.startsWith('/_next/static')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // Cache headers for images
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
  }

  // API caching
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // GET requests için cache
    if (request.method === 'GET') {
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/image|favicon.ico).*)',
  ],
}
