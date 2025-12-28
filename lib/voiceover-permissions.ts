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
 * Önce cookie'den kontrol eder (daha hızlı), sonra veritabanından
 * Admin her zaman erişebilmeli - bu fonksiyon kritik
 */
export async function isAdmin(userId?: string | null): Promise<boolean> {
  // ÖNCE cookie'den kontrol et (en hızlı ve güvenilir)
  const cookieStore = await cookies()
  const userRoleCookie = cookieStore.get('user-role')?.value
  
  // Cookie'de admin varsa direkt true döndür
  if (userRoleCookie?.toLowerCase() === 'admin') {
    return true
  }

  // userId varsa veritabanından da kontrol et (fallback)
  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })
      if (user?.role?.toLowerCase() === 'admin') {
        return true
      }
    } catch (error) {
      // Veritabanı hatası durumunda cookie'ye güven (zaten yukarıda kontrol edildi)
      // Hata durumunda false döndür
    }
  }

  return false
}

/**
 * Kullanıcının voiceover script'ini görüntüleyip görüntüleyemeyeceğini kontrol eder
 * Admin her zaman erişebilir
 */
export async function canViewVoiceover(
  userId: string | null | undefined,
  creatorId: string | null | undefined,
  voiceActorId: string | null | undefined,
  script: VoiceoverScript
): Promise<boolean> {
  // Admin her şeyi görebilir - ÖNCE admin kontrolü yap (en önemli)
  // userId null olsa bile cookie'den kontrol et
  const adminCheck = await isAdmin(userId)
  if (adminCheck) {
    return true
  }

  // Admin değilse, owner kontrolü yap
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

