import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getVoiceoverScriptLastActivityAt } from '@/lib/lastActivityAt'

// Cache for 60 seconds - agresif cache
export const revalidate = 60

// Tüm metinleri getir (admin için) - Filtreleme, sıralama, pagination ile
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value
    const creatorId = cookieStore.get('creator-id')?.value
    const voiceActorIdCookie = cookieStore.get('voice-actor-id')?.value
    const userRoleCookie = cookieStore.get('user-role')?.value

    // Admin kontrolü - önce cookie'den kontrol et (daha hızlı ve güvenilir)
    let finalIsAdmin = false
    
    // Cookie'den admin kontrolü
    if (userRoleCookie && (userRoleCookie.toLowerCase() === 'admin')) {
      finalIsAdmin = true
    }
    
    // Eğer cookie'de admin yoksa ama userId varsa, veritabanından kontrol et
    if (!finalIsAdmin && userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        })
        if (user?.role) {
          finalIsAdmin = user.role.toLowerCase() === 'admin'
        }
      } catch (error) {
        // Veritabanı hatası durumunda cookie'ye güven
        // finalIsAdmin zaten false
      }
    }

    // Admin ise her şeyi görebilir - erken devam et
    // Admin değilse, içerik üreticisi veya seslendirmen kontrolü
    if (!finalIsAdmin && !userId && !creatorId && !voiceActorIdCookie) {
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
    const andConditions: any[] = []

    // Admin ise TÜM kayıtları görebilmeli - filtreleme yapma
    // Admin değilse, creator veya voice actor sadece kendi kayıtlarını görebilir
    if (!finalIsAdmin) {
      // Creator sadece kendi scriptlerini görmeli
      if (creatorId) {
        whereClause.creatorId = creatorId
      }
      // Voice Actor hem henüz atanmamış hem de kendisine atanmış metinleri görmeli
      if (voiceActorIdCookie) {
        andConditions.push({
          OR: [
            { voiceActorId: null }, // Henüz atanmamış metinler
            { voiceActorId: voiceActorIdCookie }, // Kendisine atanmış metinler
          ]
        })
      }
    }
    // Admin için whereClause boş kalır, tüm kayıtlar görünür

    // ARCHIVED varsayılan olarak gösterilmez (tüm roller için)
    if (excludeArchived) {
      andConditions.push({ status: { not: 'ARCHIVED' } })
    }

    // Durum filtresi
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'VOICE_UPLOADED') {
        andConditions.push({ status: 'VOICE_UPLOADED' })
      } else if (statusFilter === 'WAITING_VOICE') {
        andConditions.push({ status: 'WAITING_VOICE' })
      } else if (statusFilter === 'APPROVED') {
        andConditions.push({ status: 'APPROVED' })
      } else if (statusFilter === 'REJECTED') {
        andConditions.push({ status: 'REJECTED' })
      } else if (statusFilter === 'PAID') {
        andConditions.push({ status: 'PAID' })
      } else if (statusFilter === 'ARCHIVED') {
        andConditions.push({ status: 'ARCHIVED' })
      } else {
        andConditions.push({ status: statusFilter as any })
      }
    }

    // Seslendiren filtresi (query parametresinden - admin için de geçerli)
    // Bu bir filtre, admin de kullanabilir
    // NOT: Voice actor cookie'den geldiğinde bu filtreyi kullanma (zaten OR koşulu var)
    // Ayrıca, eğer query parametresi cookie'deki ile aynıysa da ignore et
    if (voiceActorId && !voiceActorIdCookie && voiceActorId !== voiceActorIdCookie) {
      andConditions.push({ voiceActorId })
    }

    // Link var/yok filtresi (voiceLink veya audioFile kontrolü)
    if (hasAudioLink === 'true') {
      andConditions.push({
        OR: [
          { voiceLink: { not: null } },
          { audioFile: { not: null } }
        ]
      })
    } else if (hasAudioLink === 'false') {
      andConditions.push({
        AND: [
          { voiceLink: null },
          { audioFile: null }
        ]
      })
    }

    // Üretici Onayı filtresi
    if (producerApprovedFilter === 'true') {
      andConditions.push({ producerApproved: true })
    } else if (producerApprovedFilter === 'false') {
      andConditions.push({ producerApproved: false })
    }

    // Admin Onayı filtresi
    if (adminApprovedFilter === 'true') {
      andConditions.push({ adminApproved: true })
    } else if (adminApprovedFilter === 'false') {
      andConditions.push({ adminApproved: false })
    }

    // Fiyat var/yok filtresi
    if (hasPriceFilter === 'true') {
      andConditions.push({ price: { not: null } })
    } else if (hasPriceFilter === 'false') {
      andConditions.push({ price: null })
    }

    // Arama filtresi (başlık veya metin içinde)
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { text: { contains: search, mode: 'insensitive' } },
        ]
      })
    }

    // Tarih aralığı filtresi
    if (dateFrom || dateTo) {
      const dateCondition: any = {}
      if (dateFrom) {
        dateCondition.gte = new Date(dateFrom)
      }
      if (dateTo) {
        dateCondition.lte = new Date(dateTo)
      }
      andConditions.push({ createdAt: dateCondition })
    }

    // AND koşullarını whereClause'a ekle
    if (andConditions.length > 0) {
      whereClause.AND = andConditions
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
        editPack: {
          select: {
            token: true,
            expiresAt: true,
          },
        },
      },
      // Varsayılan sıralama için daha fazla veri çek (gruplar için)
      take: useDefaultSorting && !statusFilter && !producerApprovedFilter && !adminApprovedFilter && !hasPriceFilter && !hasAudioLink && !voiceActorId && !search && !dateFrom && !dateTo ? limit * 10 : limit,
      orderBy: { createdAt: 'asc' }, // Eski → Yeni sıralama
    })

      // Tarih bazlı sıralama zaten yapıldı (createdAt: 'asc')
    // Pagination için limit uygula
    const paginatedScripts = scripts.slice(skip, skip + limit)
    
    const sortedScripts = paginatedScripts

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



