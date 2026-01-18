import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Cache for 60 seconds
export const revalidate = 60

// Tüm içerik kayıtlarını getir
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value
    const creatorId = cookieStore.get('creator-id')?.value
    const voiceActorId = cookieStore.get('voice-actor-id')?.value
    const teamMemberId = cookieStore.get('team-member-id')?.value

    // En az bir kimlik doğrulaması gerekli
    if (!userId && !creatorId && !voiceActorId && !teamMemberId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    const search = searchParams.get('search')
    const filterCreatorId = searchParams.get('creatorId')
    const filterVoiceActorId = searchParams.get('voiceActorId')
    const filterEditorId = searchParams.get('editorId')

    const skip = (page - 1) * limit

    // Where clause oluştur
    const whereClause: any = {}
    const andConditions: any[] = []

    // Admin ise tüm kayıtları görebilir
    // Diğer roller sadece kendi kayıtlarını görebilir
    if (!userId) {
      if (creatorId) {
        andConditions.push({ creatorId })
      }
      if (voiceActorId) {
        andConditions.push({
          OR: [
            { voiceActorId: null }, // Henüz atanmamış
            { voiceActorId }
          ]
        })
      }
      if (teamMemberId) {
        andConditions.push({
          OR: [
            { editorId: null }, // Henüz atanmamış
            { editorId: teamMemberId }
          ]
        })
      }
    }

    // Filtreler
    if (status && status !== 'all') {
      andConditions.push({ status })
    }

    if (platform) {
      andConditions.push({ platform })
    }

    if (filterCreatorId) {
      andConditions.push({ creatorId: filterCreatorId })
    }

    if (filterVoiceActorId) {
      andConditions.push({ voiceActorId: filterVoiceActorId })
    }

    if (filterEditorId) {
      andConditions.push({ editorId: filterEditorId })
    }

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      })
    }

    if (andConditions.length > 0) {
      whereClause.AND = andConditions
    }

    // Toplam sayı
    const total = await prisma.contentRegistry.count({ where: whereClause })

    // Verileri çek
    const registries = await prisma.contentRegistry.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        platform: true,
        contentType: true,
        scriptLink: true,
        voiceLink: true,
        editLink: true,
        finalLink: true,
        scriptDeadline: true,
        voiceDeadline: true,
        editDeadline: true,
        publishDate: true,
        notes: true,
        editorNotes: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        voiceActor: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        editor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        voiceoverScript: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        content: {
          select: {
            id: true,
            title: true,
            url: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      registries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching content registries:', error)
    return NextResponse.json(
      { error: 'İçerik kayıtları getirilemedi' },
      { status: 500 }
    )
  }
}

// Yeni içerik kaydı oluştur
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
    const {
      title,
      description,
      platform,
      contentType,
      voiceActorId,
      editorId,
      voiceoverScriptId,
      scriptLink,
      voiceLink,
      editLink,
      scriptDeadline,
      voiceDeadline,
      editDeadline,
      publishDate,
      notes,
    } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Başlık gereklidir' },
        { status: 400 }
      )
    }

    // Eğer voiceoverScriptId verilmişse, zaten başka bir registry'de kullanılıp kullanılmadığını kontrol et
    if (voiceoverScriptId) {
      const existingRegistry = await prisma.contentRegistry.findUnique({
        where: { voiceoverScriptId },
      })
      if (existingRegistry) {
        return NextResponse.json(
          { error: 'Bu seslendirme metni zaten başka bir içerik kaydına bağlı' },
          { status: 400 }
        )
      }
    }

    const registry = await prisma.contentRegistry.create({
      data: {
        title,
        description: description || null,
        platform: platform || null,
        contentType: contentType || null,
        creatorId: creatorId || null,
        voiceActorId: voiceActorId || null,
        editorId: editorId || null,
        voiceoverScriptId: voiceoverScriptId || null,
        scriptLink: scriptLink || null,
        voiceLink: voiceLink || null,
        editLink: editLink || null,
        scriptDeadline: scriptDeadline ? new Date(scriptDeadline) : null,
        voiceDeadline: voiceDeadline ? new Date(voiceDeadline) : null,
        editDeadline: editDeadline ? new Date(editDeadline) : null,
        publishDate: publishDate ? new Date(publishDate) : null,
        notes: notes || null,
        status: 'DRAFT',
      },
      include: {
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
        editor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'İçerik kaydı başarıyla oluşturuldu',
      registry,
    })
  } catch (error: any) {
    console.error('Error creating content registry:', error)
    return NextResponse.json(
      { error: error.message || 'İçerik kaydı oluşturulamadı' },
      { status: 500 }
    )
  }
}

