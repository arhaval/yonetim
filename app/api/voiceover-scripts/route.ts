import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Cache for 30 seconds
export const revalidate = 30

// Tüm metinleri getir (admin için) - Filtreleme, sıralama, pagination ile
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value
    const creatorId = cookieStore.get('creator-id')?.value

    // Admin veya içerik üreticisi kontrolü
    if (!userId && !creatorId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const statusFilter = searchParams.get('status') // pending, audio-uploaded, approved, paid, archived
    const voiceActorId = searchParams.get('voiceActorId')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const skip = (page - 1) * limit

    // Where clause oluştur
    let whereClause: any = {}

    // İçerik üreticisi sadece kendi metinlerini görür
    if (creatorId) {
      whereClause.creatorId = creatorId
    }

    // Durum filtresi
    if (statusFilter) {
      if (statusFilter === 'audio-uploaded') {
        // Ses yüklendi ama onaylanmadı
        whereClause.audioFile = { not: null }
        whereClause.status = { notIn: ['approved', 'paid'] }
      } else if (statusFilter === 'pending') {
        // Ses bekleniyor
        whereClause.status = 'pending'
        whereClause.audioFile = null
      } else if (statusFilter === 'approved') {
        whereClause.status = 'approved'
      } else if (statusFilter === 'paid') {
        whereClause.status = 'paid'
      } else if (statusFilter === 'archived') {
        whereClause.status = 'archived'
      } else {
        whereClause.status = statusFilter
      }
    }

    // Seslendiren filtresi
    if (voiceActorId) {
      whereClause.voiceActorId = voiceActorId
    }

    // Arama filtresi (başlık veya metin içinde)
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { text: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Tarih aralığı filtresi
    if (dateFrom || dateTo) {
      whereClause.createdAt = {}
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo)
      }
    }

    // Toplam sayı
    const total = await prisma.voiceoverScript.count({ where: whereClause })

    // Verileri çek
    const scripts = await prisma.voiceoverScript.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        text: true,
        status: true,
        price: true,
        audioFile: true,
        contentType: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
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
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    // Client-side'da özel sıralama yapacağız (Prisma'da karmaşık olduğu için)
    const sortedScripts = scripts.sort((a, b) => {
      // 1. Ses yüklendi ama onaylanmadı (en üstte)
      const aHasAudioNotApproved = a.audioFile && a.status !== 'approved' && a.status !== 'paid'
      const bHasAudioNotApproved = b.audioFile && b.status !== 'approved' && b.status !== 'paid'
      
      if (aHasAudioNotApproved && !bHasAudioNotApproved) return -1
      if (!aHasAudioNotApproved && bHasAudioNotApproved) return 1

      // 2. Ses bekleniyor
      const aIsPending = a.status === 'pending' && !a.audioFile
      const bIsPending = b.status === 'pending' && !b.audioFile
      
      if (aIsPending && !bIsPending) return -1
      if (!aIsPending && bIsPending) return 1

      // 3. Onaylandı
      if (a.status === 'approved' && b.status !== 'approved') return -1
      if (a.status !== 'approved' && b.status === 'approved') return 1

      // 4. Ödendi
      if (a.status === 'paid' && b.status !== 'paid') return -1
      if (a.status !== 'paid' && b.status === 'paid') return 1

      // Aynı durumda, tarihe göre (en yeni üstte)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json({
      scripts: sortedScripts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching scripts:', error)
    return NextResponse.json(
      { error: 'Metinler getirilemedi' },
      { status: 500 }
    )
  }
}

// Yeni metin oluştur (admin veya içerik üreticisi)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value
    const creatorId = cookieStore.get('creator-id')?.value

    if (!userId && !creatorId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, text, contentType } = body

    if (!title || !text) {
      return NextResponse.json(
        { error: 'Başlık ve metin gereklidir' },
        { status: 400 }
      )
    }

    const script = await prisma.voiceoverScript.create({
      data: {
        title,
        text,
        contentType: contentType || null, // uzun, kısa, reels
        creatorId: creatorId || null, // Admin ise null, içerik üreticisi ise ID
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Metin başarıyla oluşturuldu',
      script,
    })
  } catch (error: any) {
    console.error('Error creating script:', error)
    return NextResponse.json(
      { error: error.message || 'Metin oluşturulamadı' },
      { status: 500 }
    )
  }
}



