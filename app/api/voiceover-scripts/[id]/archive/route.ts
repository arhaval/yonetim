import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createAuditLog } from '@/lib/audit-log'

// Metni arşivle (sadece admin)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
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

    // Metni kontrol et
    const script = await prisma.voiceoverScript.findUnique({
      where: { id },
    })

    if (!script) {
      return NextResponse.json(
        { error: 'Metin bulunamadı' },
        { status: 404 }
      )
    }

    // Eski değerleri kaydet (audit log için)
    const oldValue = {
      status: script.status,
    }

    // Metni arşivle
    const updatedScript = await prisma.voiceoverScript.update({
      where: { id },
      data: {
        status: 'archived',
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        voiceActor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Audit log
    await createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'script_archived',
      entityType: 'VoiceoverScript',
      entityId: id,
      oldValue,
      newValue: {
        status: updatedScript.status,
      },
      details: {
        title: updatedScript.title,
      },
    })

    return NextResponse.json({
      message: 'Metin başarıyla arşivlendi',
      script: updatedScript,
    })
  } catch (error: any) {
    console.error('Error archiving script:', error)
    return NextResponse.json(
      { error: error.message || 'Metin arşivlenemedi' },
      { status: 500 }
    )
  }
}

