import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-check'
import { parse, startOfDay, endOfDay } from 'date-fns'

export async function DELETE(request: NextRequest) {
  try {
    // Admin kontrolü
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      return adminCheck
    }

    const { date } = await request.json()

    if (!date) {
      return NextResponse.json(
        { error: 'Tarih belirtilmedi' },
        { status: 400 }
      )
    }

    // Tarihi parse et (dd.MM.yyyy formatından)
    const dateParts = date.split('.')
    if (dateParts.length !== 3) {
      return NextResponse.json(
        { error: 'Geçersiz tarih formatı' },
        { status: 400 }
      )
    }

    const parsedDate = parse(date, 'dd.MM.yyyy', new Date())
    const startDate = startOfDay(parsedDate)
    const endDate = endOfDay(parsedDate)

    // Bu tarihteki tüm kayıtları bul ve sil
    const deleted = await prisma.socialMediaStats.deleteMany({
      where: {
        OR: [
          {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            updatedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
    })

    return NextResponse.json({
      success: true,
      message: `${deleted.count} kayıt başarıyla silindi`,
      deletedCount: deleted.count,
    })
  } catch (error) {
    console.error('Error deleting social media stats by date:', error)
    return NextResponse.json(
      { error: 'Kayıtlar silinemedi' },
      { status: 500 }
    )
  }
}

