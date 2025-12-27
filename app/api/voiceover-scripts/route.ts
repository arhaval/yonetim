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
    const voiceActorIdCookie = cookieStore.get('voice-actor-id')?.value

    // Admin, içerik üreticisi veya seslendirmen kontrolü
    if (!userId && !creatorId && !voiceActorIdCookie) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const statusFilter = searchParams.get('status') // WAITING_VOICE, VOICE_UPLOADED, APPROVED, REJECTED, PAID, ARCHIVED
    const voiceActorId = searchParams.get('voiceActorId')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const excludeArchivedParam = searchParams.get('excludeArchived')
    const excludeArchived = excludeArchivedParam === 'true'
    const hasAudioLink = searchParams.get('hasAudioLink') // 'true' or 'false' or null
    const producerApprovedFilter = searchParams.get('producerApproved') // 'true' or 'false' or null
    const adminApprovedFilter = searchParams.get('adminApproved') // 'true' or 'false' or null
    const hasPriceFilter = searchParams.get('hasPrice') // 'true' or 'false' or null
    const useDefaultSorting = searchParams.get('useDefaultSorting') !== 'false' // Default: true

    const skip = (page - 1) * limit

    // Where clause oluştur
    let whereClause: any = {}

    // ARCHIVED varsayılan olarak gösterilmez (tüm roller için)
    if (excludeArchived) {
      whereClause.status = { not: 'ARCHIVED' }
    }

    // Durum filtresi
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'VOICE_UPLOADED') {
        whereClause.status = 'VOICE_UPLOADED'
      } else if (statusFilter === 'WAITING_VOICE') {
        whereClause.status = 'WAITING_VOICE'
      } else if (statusFilter === 'APPROVED') {
        whereClause.status = 'APPROVED'
      } else if (statusFilter === 'REJECTED') {
        whereClause.status = 'REJECTED'
      } else if (statusFilter === 'PAID') {
        whereClause.status = 'PAID'
      } else if (statusFilter === 'ARCHIVED') {
        whereClause.status = 'ARCHIVED'
      } else {
        whereClause.status = statusFilter as any
      }
    }

    // Seslendiren filtresi
    if (voiceActorId) {
      whereClause.voiceActorId = voiceActorId
    }

    // Link var/yok filtresi (voiceLink veya audioFile kontrolü)
    if (hasAudioLink === 'true') {
      whereClause.OR = [
        { voiceLink: { not: null } },
        { audioFile: { not: null } }
      ]
    } else if (hasAudioLink === 'false') {
      whereClause.AND = [
        { voiceLink: null },
        { audioFile: null }
      ]
    }

    // Üretici Onayı filtresi
    if (producerApprovedFilter === 'true') {
      whereClause.producerApproved = true
    } else if (producerApprovedFilter === 'false') {
      whereClause.producerApproved = false
    }

    // Admin Onayı filtresi
    if (adminApprovedFilter === 'true') {
      whereClause.adminApproved = true
    } else if (adminApprovedFilter === 'false') {
      whereClause.adminApproved = false
    }

    // Fiyat var/yok filtresi
    if (hasPriceFilter === 'true') {
      whereClause.price = { not: null }
    } else if (hasPriceFilter === 'false') {
      whereClause.price = null
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
        audioFile: true, // Backward compatibility
        voiceLink: true,
        contentType: true,
        notes: true,
        rejectionReason: true,
        producerApproved: true,
        producerApprovedAt: true,
        producerApprovedBy: true,
        adminApproved: true,
        adminApprovedAt: true,
        adminApprovedBy: true,
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
      // Varsayılan sıralama için daha fazla veri çek (gruplar için)
      take: useDefaultSorting && !statusFilter && !producerApprovedFilter && !adminApprovedFilter && !hasPriceFilter && !hasAudioLink && !voiceActorId && !search && !dateFrom && !dateTo ? limit * 10 : limit,
      orderBy: { createdAt: 'desc' }, // İçerik üreticisinin metni yüklediği tarih (createdAt) bazlı
    })

    // Varsayılan sıralama mantığı (eğer filtre yoksa)
    let sortedScripts = scripts
    if (useDefaultSorting && !statusFilter && !producerApprovedFilter && !adminApprovedFilter && !hasPriceFilter && !hasAudioLink && !voiceActorId && !search && !dateFrom && !dateTo) {
      // Grup 1: producerApproved = false (Ses onayı bekleyenler)
      const group1 = scripts.filter(s => !s.producerApproved)
      // Grup 2: producerApproved = true AND adminApproved = false (Admin fiyat/onay bekleyenler)
      const group2 = scripts.filter(s => s.producerApproved && !s.adminApproved)
      // Grup 3: adminApproved = true (Video yapım hazır)
      const group3 = scripts.filter(s => s.adminApproved)
      
      // Her grup içinde createdAt DESC (zaten orderBy ile geliyor, ama emin olmak için tekrar sırala)
      group1.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      group2.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      group3.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      // Grupları birleştir
      sortedScripts = [...group1, ...group2, ...group3]
      
      // Pagination için limit uygula
      sortedScripts = sortedScripts.slice(skip, skip + limit)
    }

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



