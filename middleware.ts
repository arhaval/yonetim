import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('user-id')
  const userRole = request.cookies.get('user-role')?.value
  const streamerId = request.cookies.get('streamer-id')
  const creatorId = request.cookies.get('creator-id')
  const voiceActorId = request.cookies.get('voice-actor-id')
  const teamMemberId = request.cookies.get('team-member-id')
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isStreamerLoginPage = request.nextUrl.pathname.startsWith('/streamer-login')
  const isStreamerDashboard = request.nextUrl.pathname.startsWith('/streamer-dashboard')
  const isCreatorLoginPage = request.nextUrl.pathname.startsWith('/creator-login')
  const isCreatorDashboard = request.nextUrl.pathname.startsWith('/creator-dashboard')
  const isVoiceActorLoginPage = request.nextUrl.pathname.startsWith('/voice-actor-login')
  const isVoiceActorDashboard = request.nextUrl.pathname.startsWith('/voice-actor-dashboard')
  const isTeamLoginPage = request.nextUrl.pathname.startsWith('/team-login')
  const isTeamDashboard = request.nextUrl.pathname.startsWith('/team-dashboard')
  const isApiAuth = request.nextUrl.pathname.startsWith('/api/auth')
  const isApiStreamerAuth = request.nextUrl.pathname.startsWith('/api/streamer-auth')
  const isApiStreamer = request.nextUrl.pathname.startsWith('/api/streamer')
  const isApiCreatorAuth = request.nextUrl.pathname.startsWith('/api/creator-auth')
  const isApiCreator = request.nextUrl.pathname.startsWith('/api/creator')
  const isApiContentCreators = request.nextUrl.pathname.startsWith('/api/content-creators')
  const isApiVoiceActorAuth = request.nextUrl.pathname.startsWith('/api/voice-actor-auth')
  const isApiVoiceActor = request.nextUrl.pathname.startsWith('/api/voice-actor')
  const isApiVoiceActors = request.nextUrl.pathname.startsWith('/api/voice-actors')
  const isApiVoiceActorContents = request.nextUrl.pathname.startsWith('/api/voice-actor/contents')
  const isApiTeamAuth = request.nextUrl.pathname.startsWith('/api/team-auth')
  const isApiTeam = request.nextUrl.pathname.startsWith('/api/team')
  const isApiContent = request.nextUrl.pathname.startsWith('/api/content')
  const isApiVoiceoverScripts = request.nextUrl.pathname.startsWith('/api/voiceover-scripts')
  const isApiUpload = request.nextUrl.pathname.startsWith('/api/upload')
  const isApiMigrate = request.nextUrl.pathname.startsWith('/api/migrate')

  // API auth endpoint'lerine izin ver
  if (isApiAuth || isApiStreamerAuth || isApiStreamer || isApiCreatorAuth || isApiCreator || isApiContentCreators || isApiVoiceActorAuth || isApiVoiceActor || isApiVoiceActors || isApiVoiceActorContents || isApiTeamAuth || isApiTeam || isApiContent || isApiVoiceoverScripts || isApiUpload || isApiMigrate) {
    return NextResponse.next()
  }

  // Streamer login sayfasına her zaman izin ver
  if (isStreamerLoginPage) {
    // Eğer zaten giriş yapmışsa dashboard'a yönlendir
    if (streamerId) {
      return NextResponse.redirect(new URL('/streamer-dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Streamer dashboard için kontrol
  if (isStreamerDashboard) {
    if (!streamerId) {
      return NextResponse.redirect(new URL('/streamer-login', request.url))
    }
    return NextResponse.next()
  }

  // Creator login sayfasına her zaman izin ver
  if (isCreatorLoginPage) {
    // Eğer zaten giriş yapmışsa dashboard'a yönlendir
    if (creatorId) {
      return NextResponse.redirect(new URL('/creator-dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Creator dashboard için kontrol
  if (isCreatorDashboard) {
    if (!creatorId) {
      return NextResponse.redirect(new URL('/creator-login', request.url))
    }
    return NextResponse.next()
  }

  // Voice Actor login sayfasına her zaman izin ver
  if (isVoiceActorLoginPage) {
    // Eğer zaten giriş yapmışsa dashboard'a yönlendir
    if (voiceActorId) {
      return NextResponse.redirect(new URL('/voice-actor-dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Voice Actor dashboard için kontrol
  if (isVoiceActorDashboard) {
    if (!voiceActorId) {
      return NextResponse.redirect(new URL('/voice-actor-login', request.url))
    }
    return NextResponse.next()
  }

  // Voice Actor routes için kontrol (/voice-actor/**)
  const isVoiceActorRoute = request.nextUrl.pathname.startsWith('/voice-actor/')
  if (isVoiceActorRoute) {
    if (!voiceActorId) {
      const redirectUrl = new URL('/login-selection', request.url)
      redirectUrl.searchParams.set('reason', 'middleware_denied_no_session')
      redirectUrl.searchParams.set('from', request.nextUrl.pathname)
      redirectUrl.searchParams.set('role', 'voice-actor')
      return NextResponse.redirect(redirectUrl)
    }
    return NextResponse.next()
  }

  // Team Member login sayfasına her zaman izin ver
  if (isTeamLoginPage) {
    // Eğer zaten giriş yapmışsa dashboard'a yönlendir
    if (teamMemberId) {
      return NextResponse.redirect(new URL('/team-dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Team Member dashboard için kontrol
  if (isTeamDashboard) {
    if (!teamMemberId) {
      return NextResponse.redirect(new URL('/team-login', request.url))
    }
    return NextResponse.next()
  }

  // Admin login sayfası kontrolü - HER ZAMAN İZİN VER
  const isAdminLoginPage = request.nextUrl.pathname.startsWith('/admin-login')
  if (isAdminLoginPage) {
    // Eğer zaten admin olarak giriş yapmışsa dashboard'a yönlendir
    if (userId && (userRole === 'admin' || userRole === 'ADMIN')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    // Admin login sayfasına her zaman izin ver
    return NextResponse.next()
  }

  // Normal login sayfasındaysa ve zaten giriş yapmışsa dashboard'a yönlendir
  if (isAuthPage && userId) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Login sayfasına her zaman izin ver (yayıncı, seslendirmen, ekip üyesi girişleri için)
  if (isAuthPage) {
    return NextResponse.next()
  }

  // Login selection sayfasına her zaman izin ver
  const isLoginSelectionPage = request.nextUrl.pathname === '/login-selection'
  if (isLoginSelectionPage) {
    return NextResponse.next()
  }

  // Ana sayfa (/) - giriş yapmamışsa login selection'a yönlendir
  if (request.nextUrl.pathname === '/') {
    // Cookie kontrolü - userId yoksa veya boşsa login selection'a yönlendir
    if (!userId || userId.value === '' || userId.value === undefined) {
      return NextResponse.redirect(new URL('/login-selection', request.url))
    }
    // Giriş yapmışsa dashboard'a devam et
    return NextResponse.next()
  }

  // My Voiceovers sayfası - sadece creator erişebilir
  const isMyVoiceoversPage = request.nextUrl.pathname.startsWith('/my-voiceovers')
  if (isMyVoiceoversPage) {
    if (!creatorId) {
      return NextResponse.redirect(new URL('/creator-login', request.url))
    }
    return NextResponse.next()
  }

  // My Assignments sayfası - sadece voice actor erişebilir
  const isMyAssignmentsPage = request.nextUrl.pathname.startsWith('/my-assignments')
  if (isMyAssignmentsPage) {
    if (!voiceActorId) {
      return NextResponse.redirect(new URL('/voice-actor-login', request.url))
    }
    return NextResponse.next()
  }

  // Voice Actor Payments sayfası - sadece voice actor erişebilir
  const isVoiceActorPaymentsPage = request.nextUrl.pathname.startsWith('/voice-actor-payments')
  if (isVoiceActorPaymentsPage) {
    if (!voiceActorId) {
      return NextResponse.redirect(new URL('/voice-actor-login', request.url))
    }
    return NextResponse.next()
  }

  // Voiceover scripts sayfası - sadece auth kontrolü (role kontrolü YOK)
  // Sayfa her zaman render edilmeli, yetki kontrolü API route'larda yapılacak
  const isVoiceoverScriptsPage = request.nextUrl.pathname.startsWith('/voiceover-scripts')
  if (isVoiceoverScriptsPage) {
    // Sadece giriş yapmış mı kontrol et (herhangi bir role)
    if (userId || creatorId || voiceActorId) {
      return NextResponse.next()
    }
    // Giriş yapmamışsa login selection'a yönlendir
    const redirectUrl = new URL('/login-selection', request.url)
    redirectUrl.searchParams.set('reason', 'middleware_denied_no_session')
    redirectUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Admin sayfalarına erişim kontrolü - sadece admin role'üne sahip kullanıcılar erişebilir
  const isAdminPage = !isAuthPage && 
                      !isAdminLoginPage &&
                      !isLoginSelectionPage &&
                      !isStreamerLoginPage && 
                      !isStreamerDashboard && 
                      !isCreatorLoginPage && 
                      !isCreatorDashboard && 
                      !isVoiceActorLoginPage && 
                      !isVoiceActorDashboard && 
                      !isVoiceActorRoute && // Voice actor route'larını admin kontrolünden çıkar
                      !isVoiceoverScriptsPage && // Voiceover scripts sayfasını admin kontrolünden çıkar
                      !isMyVoiceoversPage && // My voiceovers sayfasını admin kontrolünden çıkar
                      !isMyAssignmentsPage && // My assignments sayfasını admin kontrolünden çıkar
                      !isVoiceActorPaymentsPage && // Voice actor payments sayfasını admin kontrolünden çıkar
                      !isTeamLoginPage && 
                      !isTeamDashboard && 
                      !request.nextUrl.pathname.startsWith('/api')
  
  if (isAdminPage) {
    // Giriş yapmamışsa login selection'a yönlendir
    if (!userId) {
      const redirectUrl = new URL('/login-selection', request.url)
      redirectUrl.searchParams.set('reason', 'middleware_denied_no_session')
      redirectUrl.searchParams.set('from', request.nextUrl.pathname)
      redirectUrl.searchParams.set('role', 'admin')
      return NextResponse.redirect(redirectUrl)
    }
    
    // Admin role'üne sahip değilse erişim reddedilir
    if (userRole !== 'admin' && userRole !== 'ADMIN') {
      // Kullanıcının rolüne göre uygun dashboard'a yönlendir
      if (voiceActorId) {
        return NextResponse.redirect(new URL('/voice-actor-dashboard', request.url))
      }
      if (creatorId) {
        return NextResponse.redirect(new URL('/creator-dashboard', request.url))
      }
      if (streamerId) {
        return NextResponse.redirect(new URL('/streamer-dashboard', request.url))
      }
      if (teamMemberId) {
        return NextResponse.redirect(new URL('/team-dashboard', request.url))
      }
      // Hiçbiri yoksa login selection'a yönlendir
      const redirectUrl = new URL('/login-selection', request.url)
      redirectUrl.searchParams.set('reason', 'middleware_denied_role')
      redirectUrl.searchParams.set('from', request.nextUrl.pathname)
      redirectUrl.searchParams.set('expected_role', 'admin')
      redirectUrl.searchParams.set('actual_role', userRole || 'none')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
}




