/**
 * Unified Authentication System
 * 
 * Tüm roller için tek bir authentication sistemi.
 * Mevcut endpoint'ler bu sistemi kullanarak kod tekrarını azaltır.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  verifyPassword,
  getUserByEmail,
  getStreamerByEmail,
  getContentCreatorByEmail,
  getVoiceActorByEmail,
  getTeamMemberByEmail,
} from './auth'

export type UserRole = 'admin' | 'streamer' | 'creator' | 'voice-actor' | 'team'

export interface AuthResult {
  success: boolean
  user?: {
    id: string
    email: string | null
    name: string
    role: UserRole
  }
  error?: string
  statusCode?: number
}

export interface AuthConfig {
  cookieName: string
  loginPage: string
  dashboard: string
  checkActive?: boolean
  specialEmailCheck?: (email: string) => boolean
}

export const ROLE_CONFIG: Record<UserRole, AuthConfig> = {
  admin: {
    cookieName: 'user-id',
    loginPage: '/admin-login',
    dashboard: '/',
    checkActive: false,
    specialEmailCheck: (email) => email === 'hamitkulya3@icloud.com',
  },
  streamer: {
    cookieName: 'streamer-id',
    loginPage: '/streamer-login',
    dashboard: '/streamer-dashboard',
    checkActive: true,
  },
  creator: {
    cookieName: 'creator-id',
    loginPage: '/creator-login',
    dashboard: '/creator-dashboard',
    checkActive: true,
  },
  'voice-actor': {
    cookieName: 'voice-actor-id',
    loginPage: '/voice-actor-login',
    dashboard: '/voice-actor-dashboard',
    checkActive: true,
  },
  team: {
    cookieName: 'team-member-id',
    loginPage: '/team-login',
    dashboard: '/team-dashboard',
    checkActive: false,
  },
}

/**
 * Unified authentication function
 * Tüm roller için tek bir authentication mantığı
 */
export async function authenticateUser(
  email: string,
  password: string,
  role: UserRole
): Promise<AuthResult> {
  try {
    // Email validation
    if (!email || !password) {
      return {
        success: false,
        error: 'Email ve şifre gereklidir',
        statusCode: 400,
      }
    }

    // Email normalization
    const normalizedEmail = email.toLowerCase().trim()

    // Get user by role
    let account: any = null
    let accountRole: string = role

    const config = ROLE_CONFIG[role]

    // Special email check for admin
    if (role === 'admin' && config.specialEmailCheck) {
      if (!config.specialEmailCheck(normalizedEmail)) {
        // Admin değilse diğer rollerde ara
        // Bu durumda admin endpoint'i çağrılmamalı
      }
    }

    // Fetch user based on role
    switch (role) {
      case 'admin':
        account = await getUserByEmail(normalizedEmail)
        if (account) {
          accountRole = account.role || 'admin'
          // Admin email check
          if (config.specialEmailCheck && !config.specialEmailCheck(normalizedEmail)) {
            if (account.role !== 'admin' && account.role !== 'ADMIN') {
              return {
                success: false,
                error: 'Bu email adresi admin yetkisine sahip değil',
                statusCode: 403,
              }
            }
          }
        }
        break

      case 'streamer':
        account = await getStreamerByEmail(normalizedEmail)
        // Fallback: case-insensitive search
        if (!account) {
          const { prisma } = await import('./prisma')
          const allStreamers = await prisma.streamer.findMany({
            where: { email: { not: null } },
          })
          account = allStreamers.find(
            (s) => s.email?.toLowerCase().trim() === normalizedEmail
          ) || null
        }
        break

      case 'creator':
        account = await getContentCreatorByEmail(normalizedEmail)
        // Fallback: case-insensitive search
        if (!account) {
          const { prisma } = await import('./prisma')
          const allCreators = await prisma.contentCreator.findMany({
            where: { email: { not: null } },
          })
          account = allCreators.find(
            (c) => c.email?.toLowerCase().trim() === normalizedEmail
          ) || null
        }
        break

      case 'voice-actor':
        account = await getVoiceActorByEmail(normalizedEmail)
        // Fallback: case-insensitive search
        if (!account) {
          const { prisma } = await import('./prisma')
          const allVoiceActors = await prisma.voiceActor.findMany({
            where: { email: { not: null } },
          })
          account = allVoiceActors.find(
            (va) => va.email?.toLowerCase().trim() === normalizedEmail
          ) || null
        }
        break

      case 'team':
        account = await getTeamMemberByEmail(normalizedEmail)
        if (account) {
          accountRole = account.role || 'team'
        }
        break
    }

    // User not found
    if (!account) {
      const roleNames: Record<UserRole, string> = {
        admin: 'kullanıcı',
        streamer: 'yayıncı',
        creator: 'içerik üreticisi',
        'voice-actor': 'seslendirmen',
        team: 'ekip üyesi',
      }
      return {
        success: false,
        error: `Bu email adresi ile kayıtlı ${roleNames[role]} bulunamadı`,
        statusCode: 401,
      }
    }

    // Password check
    if (!account.password) {
      return {
        success: false,
        error: 'Şifre ayarlanmamış. Lütfen admin ile iletişime geçin.',
        statusCode: 401,
      }
    }

    // Active check (if required)
    if (config.checkActive && account.isActive === false) {
      return {
        success: false,
        error: 'Hesabınız aktif değil. Lütfen admin ile iletişime geçin.',
        statusCode: 403,
      }
    }

    // Verify password
    const isValid = await verifyPassword(password, account.password)
    if (!isValid) {
      return {
        success: false,
        error: 'Şifre hatalı. Lütfen tekrar deneyin.',
        statusCode: 401,
      }
    }

    // Success
    return {
      success: true,
      user: {
        id: account.id,
        email: account.email,
        name: account.name,
        role: role,
      },
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`,
      statusCode: 500,
    }
  }
}

/**
 * Set authentication cookie
 */
export async function setAuthCookie(
  userId: string,
  role: UserRole
): Promise<void> {
  const config = ROLE_CONFIG[role]
  const cookieStore = await cookies()

  cookieStore.set(config.cookieName, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

/**
 * Clear authentication cookie
 */
export async function clearAuthCookie(role: UserRole): Promise<void> {
  const config = ROLE_CONFIG[role]
  const cookieStore = await cookies()

  cookieStore.delete(config.cookieName)
}

/**
 * Get authenticated user ID from cookie
 */
export async function getAuthUserId(role: UserRole): Promise<string | null> {
  const config = ROLE_CONFIG[role]
  const cookieStore = await cookies()
  const cookie = cookieStore.get(config.cookieName)
  return cookie?.value || null
}

/**
 * Unified login handler
 * Mevcut endpoint'ler bu fonksiyonu kullanabilir
 */
export async function handleLogin(
  request: NextRequest,
  role: UserRole
): Promise<NextResponse> {
  try {
    const { email, password } = await request.json()
    const result = await authenticateUser(email, password, role)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 401 }
      )
    }

    // Set cookie
    if (result.user) {
      await setAuthCookie(result.user.id, role)
    }

    // Return user data in the format expected by existing endpoints
    const { NextResponse } = await import('next/server')
    
    // Format response based on role
    switch (role) {
      case 'streamer':
        return NextResponse.json({
          streamer: {
            id: result.user!.id,
            email: result.user!.email,
            name: result.user!.name,
          },
        })
      case 'creator':
        return NextResponse.json({
          creator: {
            id: result.user!.id,
            email: result.user!.email,
            name: result.user!.name,
          },
        })
      case 'voice-actor':
        return NextResponse.json({
          voiceActor: {
            id: result.user!.id,
            email: result.user!.email,
            name: result.user!.name,
          },
        })
      case 'team':
        // Team member response needs role field
        const { prisma } = await import('./prisma')
        const member = await prisma.teamMember.findUnique({
          where: { id: result.user!.id },
          select: { role: true },
        })
        return NextResponse.json({
          member: {
            id: result.user!.id,
            email: result.user!.email,
            name: result.user!.name,
            role: member?.role || 'team',
          },
        })
      default:
        return NextResponse.json({
          user: {
            id: result.user!.id,
            email: result.user!.email,
            name: result.user!.name,
          },
        })
    }
  } catch (error: any) {
    const { NextResponse } = await import('next/server')
    return NextResponse.json(
      { error: `Bir hata oluştu: ${error.message || 'Bilinmeyen hata'}` },
      { status: 500 }
    )
  }
}

