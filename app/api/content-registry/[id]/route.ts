import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Tek bir içerik kaydını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { id } = resolvedParams

    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value
    const creatorId = cookieStore.get('creator-id')?.value
    const voiceActorId = cookieStore.get('voice-actor-id')?.value
    const teamMemberId = cookieStore.get('team-member-id')?.value

    if (!userId && !creatorId && !voiceActorId && !teamMemberId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const registry = await prisma.contentRegistry.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            email: true,
          },
        },
        voiceActor: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            email: true,
          },
        },
        streamer: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            email: true,
          },
        },
        editor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
        voiceoverScript: {
          select: {
            id: true,
            title: true,
            text: true,
            status: true,
            voiceLink: true,
            audioFile: true,
          },
        },
        content: {
          select: {
            id: true,
            title: true,
            url: true,
            platform: true,
            type: true,
            views: true,
            likes: true,
          },
        },
      },
    })

    if (!registry) {
      return NextResponse.json(
        { error: 'İçerik kaydı bulunamadı' },
        { status: 404 }
      )
    }

    // Yetki kontrolü - admin değilse sadece kendi kayıtlarını görebilir
    if (!userId) {
      const hasAccess =
        (creatorId && registry.creatorId === creatorId) ||
        (voiceActorId && registry.voiceActorId === voiceActorId) ||
        (teamMemberId && registry.editorId === teamMemberId)

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Bu kayda erişim yetkiniz yok' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({ registry })
  } catch (error) {
    console.error('Error fetching content registry:', error)
    return NextResponse.json(
      { error: 'İçerik kaydı getirilemedi' },
      { status: 500 }
    )
  }
}

// İçerik kaydını güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { id } = resolvedParams

    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value
    const creatorId = cookieStore.get('creator-id')?.value
    const voiceActorId = cookieStore.get('voice-actor-id')?.value
    const teamMemberId = cookieStore.get('team-member-id')?.value

    if (!userId && !creatorId && !voiceActorId && !teamMemberId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const existingRegistry = await prisma.contentRegistry.findUnique({
      where: { id },
    })

    if (!existingRegistry) {
      return NextResponse.json(
        { error: 'İçerik kaydı bulunamadı' },
        { status: 404 }
      )
    }

    // Yetki kontrolü
    if (!userId) {
      const hasAccess =
        (creatorId && existingRegistry.creatorId === creatorId) ||
        (voiceActorId && existingRegistry.voiceActorId === voiceActorId) ||
        (teamMemberId && existingRegistry.editorId === teamMemberId)

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Bu kaydı düzenleme yetkiniz yok' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const {
      title,
      description,
      scriptText,
      status,
      platform,
      contentType,
      creatorId: newCreatorId,
      voiceActorId: newVoiceActorId,
      streamerId: newStreamerId,
      editorId,
      voiceoverScriptId,
      contentId,
      scriptLink,
      voiceLink,
      editLink,
      finalLink,
      scriptDeadline,
      voiceDeadline,
      editDeadline,
      publishDate,
      notes,
      editorNotes,
      voicePrice,
      editPrice,
      voicePaid,
      editPaid,
    } = body

    // voiceoverScriptId değiştiriliyorsa, başka bir registry'de kullanılıp kullanılmadığını kontrol et
    if (voiceoverScriptId && voiceoverScriptId !== existingRegistry.voiceoverScriptId) {
      const existingScriptRegistry = await prisma.contentRegistry.findUnique({
        where: { voiceoverScriptId },
      })
      if (existingScriptRegistry && existingScriptRegistry.id !== id) {
        return NextResponse.json(
          { error: 'Bu seslendirme metni zaten başka bir içerik kaydına bağlı' },
          { status: 400 }
        )
      }
    }

    // contentId değiştiriliyorsa, başka bir registry'de kullanılıp kullanılmadığını kontrol et
    if (contentId && contentId !== existingRegistry.contentId) {
      const existingContentRegistry = await prisma.contentRegistry.findUnique({
        where: { contentId },
      })
      if (existingContentRegistry && existingContentRegistry.id !== id) {
        return NextResponse.json(
          { error: 'Bu içerik zaten başka bir içerik kaydına bağlı' },
          { status: 400 }
        )
      }
    }

    // Güncelleme verilerini hazırla
    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (scriptText !== undefined) updateData.scriptText = scriptText
    if (status !== undefined) updateData.status = status
    if (platform !== undefined) updateData.platform = platform
    if (contentType !== undefined) updateData.contentType = contentType
    if (scriptLink !== undefined) updateData.scriptLink = scriptLink
    if (voiceLink !== undefined) updateData.voiceLink = voiceLink
    if (editLink !== undefined) updateData.editLink = editLink
    if (finalLink !== undefined) updateData.finalLink = finalLink
    if (notes !== undefined) updateData.notes = notes
    if (editorNotes !== undefined) updateData.editorNotes = editorNotes

    // Admin sadece bu alanları değiştirebilir
    if (userId) {
      if (newCreatorId !== undefined) updateData.creatorId = newCreatorId || null
      if (newVoiceActorId !== undefined) updateData.voiceActorId = newVoiceActorId || null
      if (newStreamerId !== undefined) updateData.streamerId = newStreamerId || null
      if (editorId !== undefined) updateData.editorId = editorId || null
      if (voiceoverScriptId !== undefined) updateData.voiceoverScriptId = voiceoverScriptId || null
      if (contentId !== undefined) updateData.contentId = contentId || null
      if (voicePrice !== undefined) updateData.voicePrice = voicePrice
      if (editPrice !== undefined) updateData.editPrice = editPrice
      if (voicePaid !== undefined) updateData.voicePaid = voicePaid
      if (editPaid !== undefined) updateData.editPaid = editPaid
    }

    // Tarih alanları
    if (scriptDeadline !== undefined) {
      updateData.scriptDeadline = scriptDeadline ? new Date(scriptDeadline) : null
    }
    if (voiceDeadline !== undefined) {
      updateData.voiceDeadline = voiceDeadline ? new Date(voiceDeadline) : null
    }
    if (editDeadline !== undefined) {
      updateData.editDeadline = editDeadline ? new Date(editDeadline) : null
    }
    if (publishDate !== undefined) {
      updateData.publishDate = publishDate ? new Date(publishDate) : null
    }

    const registry = await prisma.contentRegistry.update({
      where: { id },
      data: updateData,
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
        streamer: {
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
      message: 'İçerik kaydı başarıyla güncellendi',
      registry,
    })
  } catch (error: any) {
    console.error('Error updating content registry:', error)
    return NextResponse.json(
      { error: error.message || 'İçerik kaydı güncellenemedi' },
      { status: 500 }
    )
  }
}

// İçerik kaydını sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { id } = resolvedParams

    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value

    // Sadece admin silebilir
    if (!userId) {
      return NextResponse.json(
        { error: 'Sadece admin içerik kaydı silebilir' },
        { status: 403 }
      )
    }

    const existingRegistry = await prisma.contentRegistry.findUnique({
      where: { id },
    })

    if (!existingRegistry) {
      return NextResponse.json(
        { error: 'İçerik kaydı bulunamadı' },
        { status: 404 }
      )
    }

    await prisma.contentRegistry.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'İçerik kaydı başarıyla silindi',
    })
  } catch (error: any) {
    console.error('Error deleting content registry:', error)
    return NextResponse.json(
      { error: error.message || 'İçerik kaydı silinemedi' },
      { status: 500 }
    )
  }
}

