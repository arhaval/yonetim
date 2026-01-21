import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Ekstra iş talebini onayla veya reddet
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value

    // Sadece admin onaylayabilir
    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim - Sadece admin' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, adminNotes } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Geçersiz durum' },
        { status: 400 }
      )
    }

    const extraWorkRequest = await prisma.extraWorkRequest.update({
      where: { id: params.id },
      data: {
        status,
        adminNotes: adminNotes || null,
      },
      include: {
        contentCreator: { select: { id: true, name: true } },
        voiceActor: { select: { id: true, name: true } },
        streamer: { select: { id: true, name: true } },
        teamMember: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({
      message: status === 'approved' ? 'Talep onaylandı' : 'Talep reddedildi',
      request: extraWorkRequest,
    })
  } catch (error: any) {
    console.error('Error updating extra work request:', error)
    return NextResponse.json(
      { error: error.message || 'Talep güncellenemedi' },
      { status: 500 }
    )
  }
}

