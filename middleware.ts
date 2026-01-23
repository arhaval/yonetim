import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes - no auth required
  const publicRoutes = [
    '/giris',
    '/admin-login',
    '/streamer-login',
    '/creator-login',
    '/voice-actor-login',
    '/team-login',
    '/login',
    '/login-selection',
  ]

  // Shared routes - accessible by all authenticated users
  const sharedRoutes = [
    '/request-extra-work',
    '/my-payment-requests',
    '/submit-work',
    '/payment-request',
  ]

  // Check if route is public or shared
  const isSharedRoute = sharedRoutes.some(route => pathname.startsWith(route))
  
  if (publicRoutes.includes(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api/') || isSharedRoute) {
    const response = NextResponse.next()

    // Cache headers for static assets
    if (pathname.startsWith('/_next/static')) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    }

    // Cache headers for images
    if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/)) {
      response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
    }

    // API caching
    if (pathname.startsWith('/api/')) {
      // GET requests için cache
      if (request.method === 'GET') {
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
      }
    }

    return response
  }

  // Protected routes - check auth
  const userId = request.cookies.get('user-id')?.value
  const streamerId = request.cookies.get('streamer-id')?.value
  const creatorId = request.cookies.get('creator-id')?.value
  const voiceActorId = request.cookies.get('voice-actor-id')?.value
  const teamMemberId = request.cookies.get('team-member-id')?.value

  // Admin routes (all routes using Layout component)
  const adminRoutes = [
    '/',
    '/streams',
    '/content',
    '/financial',
    '/team',
    '/todos',
    '/social-media',
    '/content-production',
    '/all-payments',
    '/payment-approval',
    '/pending-payments',
    '/admin-payment-requests',
    '/reports',
    '/streamers',
    '/content-creators',
    '/voice-actors',
  ]

  const isAdminRoute = adminRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isAdminRoute && !userId) {
    // Admin route but no admin cookie - redirect to admin login
    return NextResponse.redirect(new URL('/admin-login', request.url))
  }

  // Streamer routes
  if (pathname.startsWith('/streamer-dashboard') && !streamerId) {
    return NextResponse.redirect(new URL('/streamer-login', request.url))
  }

  // Creator routes
  if (pathname.startsWith('/creator-dashboard') && !creatorId) {
    return NextResponse.redirect(new URL('/creator-login', request.url))
  }

  // Voice actor routes
  if ((pathname.startsWith('/voice-actor-dashboard') || pathname.startsWith('/my-voiceovers') || pathname.startsWith('/my-assignments')) && !voiceActorId) {
    return NextResponse.redirect(new URL('/voice-actor-login', request.url))
  }

  // Team routes
  if ((pathname.startsWith('/team-dashboard') || pathname.startsWith('/editor-dashboard')) && !teamMemberId) {
    return NextResponse.redirect(new URL('/team-login', request.url))
  }

  const response = NextResponse.next()

  // Cache headers for static assets
  if (pathname.startsWith('/_next/static')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // Cache headers for images
  if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/image|favicon.ico).*)',
  ],
}
