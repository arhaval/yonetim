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

    // Tarihi parse et
    let parsedDate: Date
    try {
      parsedDate = parse(date, 'dd.MM.yyyy', new Date())
      // Eğer parse başarısız olursa, alternatif format dene
      if (isNaN(parsedDate.getTime())) {
        const [day, month, year] = dateParts.map(Number)
        parsedDate = new Date(year, month - 1, day)
      }
    } catch (error) {
      const [day, month, year] = dateParts.map(Number)
      parsedDate = new Date(year, month - 1, day)
    }

    const startDate = startOfDay(parsedDate)
    const endDate = endOfDay(parsedDate)

    console.log('Deleting social media stats for date:', date, 'Range:', startDate, 'to', endDate)

    // Bu tarihteki tüm kayıtları bul ve sil
    // Önce kayıtları bulalım
    const statsToDelete = await prisma.socialMediaStats.findMany({
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

    console.log('Found stats to delete:', statsToDelete.length)

    // Kayıtları sil
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

    console.log('Deleted count:', deleted.count)

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

