import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-check'
import { createAuditLog } from '@/lib/audit-log'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Admin kontrolü
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      return adminCheck
    }

    const { id } = await Promise.resolve(params)

    // Kaydı bul
    const record = await prisma.financialRecord.findUnique({
      where: { id },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Kayıt bulunamadı' },
        { status: 404 }
      )
    }

    // Kaydı silmeden önce bilgilerini kaydet (audit log için)
    const recordData = {
      id: record.id,
      type: record.type,
      category: record.category,
      amount: record.amount,
      description: record.description,
      date: record.date.toISOString(),
      streamerId: record.streamerId,
      teamMemberId: record.teamMemberId,
      contentCreatorId: record.contentCreatorId,
      voiceActorId: record.voiceActorId,
    }

    // Kaydı sil
    await prisma.financialRecord.delete({
      where: { id },
    })

    // Audit log kaydet
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, role: true },
      })
      if (user) {
        await createAuditLog({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: 'financial_record_deleted',
          entityType: 'FinancialRecord',
          entityId: id,
          oldValue: recordData,
          details: {
            deletedAt: new Date().toISOString(),
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Finansal kayıt başarıyla silindi',
    })
  } catch (error) {
    console.error('Error deleting financial record:', error)
    return NextResponse.json(
      { error: 'Finansal kayıt silinemedi' },
      { status: 500 }
    )
  }
}

