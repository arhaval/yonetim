import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// EditPack'i voiceoverId ile getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const { id: voiceoverId } = resolvedParams

    const editPack = await prisma.editPack.findUnique({
      where: { voiceoverId },
      include: {
        voiceover: {
          select: {
            id: true,
            title: true,
            adminApproved: true,
          },
        },
      },
    })

    if (!editPack) {
      return NextResponse.json(
        { error: 'EditPack bulunamadı' },
        { status: 404 }
      )
    }

    // assetsLinks JSON parse et
    let assetsLinks = null
    if (editPack.assetsLinks) {
      try {
        assetsLinks = JSON.parse(editPack.assetsLinks)
      } catch (e) {
        assetsLinks = null
      }
    }

    return NextResponse.json({
      editPack: {
        id: editPack.id,
        token: editPack.token,
        editorNotes: editPack.editorNotes,
        assetsLinks,
        createdAt: editPack.createdAt,
        expiresAt: editPack.expiresAt,
      },
    })
  } catch (error) {
    console.error('Error fetching EditPack:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// EditPack oluştur veya güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const { id: voiceoverId } = resolvedParams

    const body = await request.json()
    const { editorNotes, assetsLinks } = body

    // VoiceoverScript kontrolü
    const script = await prisma.voiceoverScript.findUnique({
      where: { id: voiceoverId },
    })

    if (!script) {
      return NextResponse.json(
        { error: 'VoiceoverScript bulunamadı' },
        { status: 404 }
      )
    }

    // EditPack var mı kontrol et
    const existingEditPack = await prisma.editPack.findUnique({
      where: { voiceoverId },
    })

    let editPack

    if (existingEditPack) {
      // Güncelle
      const assetsLinksJson = assetsLinks ? JSON.stringify(assetsLinks) : null
      editPack = await prisma.editPack.update({
        where: { voiceoverId },
        data: {
          editorNotes: editorNotes !== undefined ? editorNotes : existingEditPack.editorNotes,
          assetsLinks: assetsLinksJson !== undefined ? assetsLinksJson : existingEditPack.assetsLinks,
        },
      })
    } else {
      // Yeni oluştur (sadece adminApproved true ise)
      if (!script.adminApproved) {
        return NextResponse.json(
          { error: 'Admin onayı olmadan EditPack oluşturulamaz' },
          { status: 400 }
        )
      }

      const { generateEditPackToken } = await import('@/lib/edit-pack-token')
      const token = generateEditPackToken()
      const createdAt = new Date()
      const expiresAt = new Date(createdAt)
      expiresAt.setDate(expiresAt.getDate() + 7) // +7 gün

      const assetsLinksJson = assetsLinks ? JSON.stringify(assetsLinks) : null

      editPack = await prisma.editPack.create({
        data: {
          voiceoverId,
          token,
          createdAt,
          expiresAt,
          editorNotes: editorNotes || null,
          assetsLinks: assetsLinksJson,
        },
      })
    }

    // assetsLinks JSON parse et
    let parsedAssetsLinks = null
    if (editPack.assetsLinks) {
      try {
        parsedAssetsLinks = JSON.parse(editPack.assetsLinks)
      } catch (e) {
        parsedAssetsLinks = null
      }
    }

    return NextResponse.json({
      editPack: {
        id: editPack.id,
        token: editPack.token,
        editorNotes: editPack.editorNotes,
        assetsLinks: parsedAssetsLinks,
        createdAt: editPack.createdAt,
        expiresAt: editPack.expiresAt,
      },
    })
  } catch (error: any) {
    console.error('Error updating EditPack:', error)
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

