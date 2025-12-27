import { NextRequest, NextResponse } from 'next/server'
import { backupDatabase } from '@/scripts/backup-database'

export const dynamic = 'force-dynamic'

/**
 * Vercel Cron Job: Otomatik Database Backup
 * 
 * Schedule: Her gün saat 02:00 (vercel.json'da ayarlanır)
 * 
 * Kullanım:
 * - Vercel otomatik olarak çağırır
 * - Veya manuel: GET /api/cron/backup-database?secret=YOUR_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron secret kontrolü
    // Vercel otomatik olarak Authorization header'ına CRON_SECRET'ı ekler
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
    // CRON_SECRET yoksa direkt devam et (güvenlik önemli değilse)

    console.log('🔄 Otomatik backup başlatılıyor...')

    const filepath = await backupDatabase({
      outputDir: './backups',
      compress: true,
      keepDays: 30, // 30 günden eski backup'ları sil
    })

    console.log('✅ Backup tamamlandı:', filepath)

    return NextResponse.json({
      success: true,
      filepath,
      timestamp: new Date().toISOString(),
      message: 'Backup başarıyla tamamlandı',
    })
  } catch (error: any) {
    console.error('❌ Backup hatası:', error)
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

