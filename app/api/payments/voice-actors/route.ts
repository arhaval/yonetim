import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, parse } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const monthParam = searchParams.get('month') || new Date().toISOString().slice(0, 7)

    const monthDate = parse(monthParam, 'yyyy-MM', new Date())
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)

    // Tüm seslendirmenleri getir
    const voiceActors = await prisma.voiceActor.findMany({
      where: {
        isActive: true,
      },
      include: {
        scripts: {
          where: {
            OR: [
              { status: 'approved' },
              { status: 'paid' },
            ],
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        },
      },
    })

    // Her seslendirmen için ödeme bilgilerini hesapla
    const payments = voiceActors.map((actor) => {
      const approvedScripts = actor.scripts.filter(s => s.status === 'approved')
      const paidScripts = actor.scripts.filter(s => s.status === 'paid')
      
      const pendingAmount = approvedScripts.reduce((sum, s) => sum + (s.price || 0), 0)
      const paidAmount = paidScripts.reduce((sum, s) => sum + (s.price || 0), 0)
      const totalAmount = pendingAmount + paidAmount

      // Detaylı metin listesi
      const scripts = actor.scripts.map(s => ({
        id: s.id,
        title: s.title,
        status: s.status,
        price: s.price || 0,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

      return {
        id: actor.id,
        name: actor.name,
        email: actor.email,
        phone: actor.phone,
        profilePhoto: actor.profilePhoto,
        pendingAmount,
        paidAmount,
        totalAmount,
        pendingCount: approvedScripts.length,
        paidCount: paidScripts.length,
        totalCount: actor.scripts.length,
        scripts, // Detaylı metin listesi
      }
    }).filter(p => p.totalAmount > 0) // Sadece ödemesi olanları göster

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching voice actor payments:', error)
    return NextResponse.json(
      { error: 'Seslendirmen ödemeleri getirilemedi' },
      { status: 500 }
    )
  }
}

