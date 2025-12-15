import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('user-id')
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

  // API auth endpoint'lerine izin ver
  if (isApiAuth || isApiStreamerAuth || isApiStreamer || isApiCreatorAuth || isApiCreator || isApiContentCreators || isApiVoiceActorAuth || isApiVoiceActor || isApiVoiceActors || isApiVoiceActorContents || isApiTeamAuth || isApiTeam || isApiContent) {
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

  // Admin login sayfasındaysa ve zaten giriş yapmışsa dashboard'a yönlendir
  if (isAuthPage && userId) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Admin login sayfası değilse ve giriş yapmamışsa login'e yönlendir
  // Streamer, Creator, Voice Actor ve Team Member sayfalarına izin ver
  if (!isAuthPage && !isStreamerLoginPage && !isStreamerDashboard && !isCreatorLoginPage && !isCreatorDashboard && !isVoiceActorLoginPage && !isVoiceActorDashboard && !isTeamLoginPage && !isTeamDashboard && !userId && !request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}




