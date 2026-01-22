import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Vercel Cron Job: Otomatik Database Backup
 * 
 * Bu endpoint Supabase'in kendi backup sistemini kullanır.
 * Sadece bir health check ve log kaydı yapar.
 */
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron secret kontrolü
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    console.log('🔄 Database health check başlatılıyor...')

    // Basit bir database health check
    const [
      streamerCount,
      streamCount,
      voiceActorCount,
      teamMemberCount,
    ] = await Promise.all([
      prisma.streamer.count(),
      prisma.stream.count(),
      prisma.voiceActor.count(),
      prisma.teamMember.count(),
    ])

    const stats = {
      streamers: streamerCount,
      streams: streamCount,
      voiceActors: voiceActorCount,
      teamMembers: teamMemberCount,
    }

    console.log('✅ Database health check tamamlandı:', stats)

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
      message: 'Database sağlıklı. Supabase otomatik backup aktif.',
    })
  } catch (error: any) {
    console.error('❌ Health check hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Bilinmeyen hata',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
