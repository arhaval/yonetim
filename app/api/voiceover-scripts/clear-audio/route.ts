import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Tüm ses dosyalarını temizle (sadece admin)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    const result = await prisma.voiceoverScript.updateMany({
      where: {
        audioFile: {
          not: null,
        },
      },
      data: {
        audioFile: null,
      },
    })

    return NextResponse.json({
      message: `${result.count} ses dosyası temizlendi`,
      count: result.count,
    })
  } catch (error: any) {
    console.error('Error clearing audio files:', error)
    return NextResponse.json(
      { error: error.message || 'Ses dosyaları temizlenemedi' },
      { status: 500 }
    )
  }
}

