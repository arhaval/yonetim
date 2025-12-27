import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public route - login gerektirmez
// Token ile EditPack'i getir ve expiresAt kontrolü yap
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> | { token: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { token } = resolvedParams

    if (!token) {
      return NextResponse.json(
        { error: 'Token gerekli' },
        { status: 400 }
      )
    }

    // EditPack'i token ile bul
    const editPack = await prisma.editPack.findUnique({
      where: { token },
      include: {
        voiceover: {
          select: {
            id: true,
            title: true,
            text: true,
            voiceLink: true,
            audioFile: true, // Backward compatibility
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

    // expiresAt kontrolü
    const now = new Date()
    if (editPack.expiresAt < now) {
      return NextResponse.json(
        { error: 'EditPack süresi dolmuş' },
        { status: 410 } // Gone
      )
    }

    // assetsLinks JSON parse et
    let assetsLinks = null
    if (editPack.assetsLinks) {
      try {
        assetsLinks = JSON.parse(editPack.assetsLinks)
      } catch (e) {
        // JSON parse hatası - null döndür
        assetsLinks = null
      }
    }

    // Response oluştur
    return NextResponse.json({
      editPack: {
        id: editPack.id,
        token: editPack.token,
        editorNotes: editPack.editorNotes,
        assetsLinks,
        createdAt: editPack.createdAt,
        expiresAt: editPack.expiresAt,
      },
      voiceover: {
        title: editPack.voiceover.title,
        text: editPack.voiceover.text,
        voiceLink: editPack.voiceover.voiceLink || editPack.voiceover.audioFile, // Backward compatibility
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

