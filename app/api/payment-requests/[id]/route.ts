import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Ödeme talebini güncelle (admin için onay/red, ödeme)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value

    // Sadece admin güncelleyebilir
    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim - Sadece admin' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, adminNotes, rejectionReason } = body

    const updateData: any = {}

    if (status) {
      updateData.status = status
      
      // Status'e göre tarih güncelle
      if (status === 'APPROVED') {
        updateData.approvedAt = new Date()
      } else if (status === 'PAID') {
        updateData.paidAt = new Date()
        if (!updateData.approvedAt) {
          updateData.approvedAt = new Date()
        }
      }
    }

    if (adminNotes !== undefined) updateData.adminNotes = adminNotes
    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason

    const paymentRequest = await prisma.paymentRequest.update({
      where: { id: params.id },
      data: updateData,
      include: {
        contentCreator: {
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
        streamer: {
          select: {
            id: true,
            name: true,
          },
        },
        teamMember: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Eğer ödeme yapıldıysa finansal kayıt oluştur
    if (status === 'PAID') {
      const requester = 
        paymentRequest.contentCreator ||
        paymentRequest.voiceActor ||
        paymentRequest.streamer ||
        paymentRequest.teamMember

      const categoryMap: any = {
        CONTENT: 'İçerik Üretimi Ödemesi',
        VOICE: 'Seslendirme Ödemesi',
        EDIT: 'Kurgu Ödemesi',
        STREAM: 'Yayın Ödemesi',
        DESIGN: 'Tasarım Ödemesi',
        MANAGEMENT: 'Yönetim Ödemesi',
        OTHER: 'Diğer Ödeme',
      }

      const financialData: any = {
        type: 'expense',
        category: categoryMap[paymentRequest.type] || 'Diğer Ödeme',
        amount: paymentRequest.amount,
        description: `${paymentRequest.description} - ${requester?.name}`,
        date: new Date(),
      }

      // İlgili kişiye bağla
      if (paymentRequest.contentCreatorId) {
        financialData.creatorId = paymentRequest.contentCreatorId
      } else if (paymentRequest.voiceActorId) {
        financialData.voiceActorId = paymentRequest.voiceActorId
      } else if (paymentRequest.streamerId) {
        financialData.streamerId = paymentRequest.streamerId
      } else if (paymentRequest.teamMemberId) {
        financialData.teamMemberId = paymentRequest.teamMemberId
      }

      await prisma.financial.create({
        data: financialData,
      })
    }

    return NextResponse.json({
      message: 'Ödeme talebi güncellendi',
      request: paymentRequest,
    })
  } catch (error: any) {
    console.error('Error updating payment request:', error)
    return NextResponse.json(
      { error: error.message || 'Ödeme talebi güncellenemedi' },
      { status: 500 }
    )
  }
}

// Ödeme talebini sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value
    const creatorId = cookieStore.get('creator-id')?.value
    const voiceActorId = cookieStore.get('voice-actor-id')?.value
    const streamerId = cookieStore.get('streamer-id')?.value
    const teamMemberId = cookieStore.get('team-member-id')?.value

    // Talebi getir
    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: params.id },
    })

    if (!paymentRequest) {
      return NextResponse.json(
        { error: 'Ödeme talebi bulunamadı' },
        { status: 404 }
      )
    }

    // Sadece admin veya talep sahibi silebilir
    const isOwner =
      (creatorId && paymentRequest.contentCreatorId === creatorId) ||
      (voiceActorId && paymentRequest.voiceActorId === voiceActorId) ||
      (streamerId && paymentRequest.streamerId === streamerId) ||
      (teamMemberId && paymentRequest.teamMemberId === teamMemberId)

    if (!userId && !isOwner) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Sadece PENDING durumundaki talepler silinebilir
    if (paymentRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Sadece bekleyen talepler silinebilir' },
        { status: 400 }
      )
    }

    await prisma.paymentRequest.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Ödeme talebi silindi',
    })
  } catch (error: any) {
    console.error('Error deleting payment request:', error)
    return NextResponse.json(
      { error: error.message || 'Ödeme talebi silinemedi' },
      { status: 500 }
    )
  }
}

