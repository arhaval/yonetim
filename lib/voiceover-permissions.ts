import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export interface VoiceoverUser {
  id: string
  role?: string
  isAdmin?: boolean
}

export interface VoiceoverScript {
  id: string
  creatorId: string | null
  voiceActorId: string | null
  creator?: { id: string } | null
  voiceActor?: { id: string } | null
}

/**
 * Kullanıcının admin olup olmadığını kontrol eder
 * Önce cookie'den kontrol eder, sonra veritabanından
 */
export async function isAdmin(userId?: string | null): Promise<boolean> {
  if (!userId) {
    // Cookie'den admin kontrolü
    const cookieStore = await cookies()
    const userRoleCookie = cookieStore.get('user-role')?.value
    return userRoleCookie?.toLowerCase() === 'admin'
  }

  // Cookie'den kontrol
  const cookieStore = await cookies()
  const userRoleCookie = cookieStore.get('user-role')?.value
  if (userRoleCookie?.toLowerCase() === 'admin') {
    return true
  }

  // Veritabanından kontrol
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
    return user?.role?.toLowerCase() === 'admin' || false
  } catch (error) {
    // Veritabanı hatası durumunda cookie'ye güven
    return userRoleCookie?.toLowerCase() === 'admin' || false
  }
}

/**
 * Kullanıcının voiceover script'ini görüntüleyip görüntüleyemeyeceğini kontrol eder
 */
export async function canViewVoiceover(
  userId: string | null | undefined,
  creatorId: string | null | undefined,
  voiceActorId: string | null | undefined,
  script: VoiceoverScript
): Promise<boolean> {
  // Admin her şeyi görebilir
  if (userId && (await isAdmin(userId))) {
    return true
  }

  // Creator kendi script'lerini görebilir
  if (creatorId && script.creatorId === creatorId) {
    return true
  }

  // Voice actor kendi script'lerini görebilir
  if (voiceActorId && script.voiceActorId === voiceActorId) {
    return true
  }

  return false
}

/**
 * Kullanıcının voiceover script'inin ses linkini düzenleyip düzenleyemeyeceğini kontrol eder
 */
export async function canEditVoiceLink(
  userId: string | null | undefined,
  voiceActorId: string | null | undefined,
  script: VoiceoverScript
): Promise<boolean> {
  // Admin her şeyi düzenleyebilir
  if (userId && (await isAdmin(userId))) {
    return true
  }

  // Voice actor kendi script'lerinin ses linkini düzenleyebilir
  if (voiceActorId && script.voiceActorId === voiceActorId) {
    return true
  }

  return false
}

/**
 * Kullanıcının producer (içerik üreticisi) onayı yapıp yapamayacağını kontrol eder
 */
export async function canProducerApprove(
  userId: string | null | undefined,
  creatorId: string | null | undefined,
  script: VoiceoverScript
): Promise<boolean> {
  // Admin producer onayı yapabilir
  if (userId && (await isAdmin(userId))) {
    return true
  }

  // Creator kendi script'lerini onaylayabilir
  if (creatorId && script.creatorId === creatorId) {
    return true
  }

  return false
}

/**
 * Kullanıcının admin onayı yapıp yapamayacağını kontrol eder
 */
export async function canAdminApprove(
  userId: string | null | undefined
): Promise<boolean> {
  if (!userId) return false
  return await isAdmin(userId)
}

/**
 * Kullanıcının voiceover script'ini ödeme olarak işaretleyip işaretleyemeyeceğini kontrol eder
 */
export async function canMarkAsPaid(
  userId: string | null | undefined
): Promise<boolean> {
  if (!userId) return false
  return await isAdmin(userId)
}

/**
 * Kullanıcının voiceover script'ini silebileceğini kontrol eder
 */
export async function canDeleteVoiceover(
  userId: string | null | undefined
): Promise<boolean> {
  if (!userId) return false
  return await isAdmin(userId)
}

