import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// İş gönderimini onayla (maliyet gir)
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
    const { status, cost, adminNotes } = body

    const updateData: any = {}
    
    if (status) {
      updateData.status = status
      if (status === 'approved') {
        updateData.approvedAt = new Date()
      }
    }
    
    if (cost !== undefined) updateData.cost = parseFloat(cost)
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes

    const workSubmission = await prisma.workSubmission.update({
      where: { id: params.id },
      data: updateData,
      include: {
        voiceActor: { select: { id: true, name: true } },
        teamMember: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({
      message: 'İş güncellendi',
      submission: workSubmission,
    })
  } catch (error: any) {
    console.error('Error updating work submission:', error)
    return NextResponse.json(
      { error: error.message || 'İş güncellenemedi' },
      { status: 500 }
    )
  }
}

