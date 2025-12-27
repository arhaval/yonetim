/**
 * Audit Log Utility
 * 
 * Sistemdeki önemli işlemleri kaydetmek için kullanılır.
 * "Kim, ne zaman, ne yaptı" kaydı tutar.
 */

import { prisma } from './prisma'
import { cookies, headers } from 'next/headers'

export type AuditAction =
  | 'payment_created'
  | 'payment_approved'
  | 'payment_deleted'
  | 'financial_record_created'
  | 'financial_record_updated'
  | 'financial_record_deleted'
  | 'script_approved'
  | 'script_creator_approved'
  | 'script_producer_approved'
  | 'script_paid'
  | 'script_assigned'
  | 'script_archived'
  | 'script_rejected'
  | 'stream_created'
  | 'stream_updated'
  | 'stream_deleted'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'streamer_created'
  | 'streamer_updated'
  | 'streamer_deleted'
  | 'creator_created'
  | 'creator_updated'
  | 'creator_deleted'
  | 'voice_actor_created'
  | 'voice_actor_updated'
  | 'voice_actor_deleted'
  | 'team_member_created'
  | 'team_member_updated'
  | 'team_member_deleted'
  | 'login'
  | 'logout'
  | 'other'

export interface AuditLogData {
  userId?: string
  userName?: string
  userRole?: string
  action: AuditAction
  entityType?: string
  entityId?: string
  oldValue?: any
  newValue?: any
  details?: any
}

/**
 * Audit log kaydı oluştur
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    // IP adresi ve user agent bilgilerini al
    const headersList = await headers()
    const ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0] ||
      headersList.get('x-real-ip') ||
      'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // Kullanıcı bilgilerini al (eğer verilmemişse)
    let userId = data.userId
    let userName = data.userName
    let userRole = data.userRole

    if (!userId || !userName) {
      const cookieStore = await cookies()
      
      // Admin/User kontrolü
      const adminId = cookieStore.get('user-id')?.value
      if (adminId) {
        const user = await prisma.user.findUnique({
          where: { id: adminId },
          select: { id: true, name: true, role: true },
        })
        if (user) {
          userId = user.id
          userName = user.name
          userRole = user.role
        }
      }

      // Streamer kontrolü
      if (!userId) {
        const streamerId = cookieStore.get('streamer-id')?.value
        if (streamerId) {
          const streamer = await prisma.streamer.findUnique({
            where: { id: streamerId },
            select: { id: true, name: true },
          })
          if (streamer) {
            userId = streamer.id
            userName = streamer.name
            userRole = 'streamer'
          }
        }
      }

      // Creator kontrolü
      if (!userId) {
        const creatorId = cookieStore.get('creator-id')?.value
        if (creatorId) {
          const creator = await prisma.contentCreator.findUnique({
            where: { id: creatorId },
            select: { id: true, name: true },
          })
          if (creator) {
            userId = creator.id
            userName = creator.name
            userRole = 'creator'
          }
        }
      }

      // Voice Actor kontrolü
      if (!userId) {
        const voiceActorId = cookieStore.get('voice-actor-id')?.value
        if (voiceActorId) {
          const voiceActor = await prisma.voiceActor.findUnique({
            where: { id: voiceActorId },
            select: { id: true, name: true },
          })
          if (voiceActor) {
            userId = voiceActor.id
            userName = voiceActor.name
            userRole = 'voice-actor'
          }
        }
      }

      // Team Member kontrolü
      if (!userId) {
        const teamMemberId = cookieStore.get('team-member-id')?.value
        if (teamMemberId) {
          const teamMember = await prisma.teamMember.findUnique({
            where: { id: teamMemberId },
            select: { id: true, name: true, role: true },
          })
          if (teamMember) {
            userId = teamMember.id
            userName = teamMember.name
            userRole = teamMember.role || 'team'
          }
        }
      }
    }

    // Audit log kaydı oluştur
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userName: userName || 'Unknown',
        userRole: userRole || null,
        action: data.action,
        entityType: data.entityType || null,
        entityId: data.entityId || null,
        oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
        newValue: data.newValue ? JSON.stringify(data.newValue) : null,
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress: ipAddress,
        userAgent: userAgent,
      },
    })
  } catch (error: any) {
    // Audit log hatası sistemin çalışmasını engellememeli
    console.error('Audit log error:', error.message)
    // Hata olsa bile devam et
  }
}

/**
 * Hızlı audit log oluştur (sadece action ile)
 */
export async function logAction(action: AuditAction, details?: any): Promise<void> {
  await createAuditLog({
    action,
    details,
  })
}

/**
 * Entity değişikliği için audit log
 */
export async function logEntityChange(
  action: AuditAction,
  entityType: string,
  entityId: string,
  oldValue?: any,
  newValue?: any,
  details?: any
): Promise<void> {
  await createAuditLog({
    action,
    entityType,
    entityId,
    oldValue,
    newValue,
    details,
  })
}

