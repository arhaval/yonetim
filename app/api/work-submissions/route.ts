import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * İş gönderme endpoint'i
 * Seslendirmen ve video editörler yaptıkları işleri buradan gönderir
 * İşler ContentRegistry'ye kaydedilir ve İçerik Merkezi'nde görünür
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const voiceActorId = cookieStore.get('voice-actor-id')?.value
    const teamMemberId = cookieStore.get('team-member-id')?.value

    if (!voiceActorId && !teamMemberId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { workType, workName, description } = body

    if (!workType || !workName) {
      return NextResponse.json(
        { error: 'İş tipi ve ismi gereklidir' },
        { status: 400 }
      )
    }

    // Kullanıcı tipine göre işlem yap
    if (voiceActorId) {
      // Seslendirmen için ContentRegistry oluştur
      const voiceActor = await prisma.voiceActor.findUnique({
        where: { id: voiceActorId },
        select: { id: true, name: true },
      })

      if (!voiceActor) {
        return NextResponse.json(
          { error: 'Seslendirmen bulunamadı' },
          { status: 404 }
        )
      }

      // ContentRegistry'ye kaydet (İçerik Merkezi'nde görünecek)
      const registry = await prisma.contentRegistry.create({
        data: {
          title: workName,
          description: description || null,
          voiceActorId: voiceActorId,
          contentType: workType, // SHORT_VOICE, LONG_VOICE
          status: 'DRAFT', // Admin onayı bekliyor
          voicePrice: 0, // Admin dolduracak
          voicePaid: false,
          notes: `Seslendirme işi gönderildi: ${workType === 'SHORT_VOICE' ? 'Kısa Ses' : 'Uzun Ses'}`,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'İş gönderildi! Admin onayladığında ödeme listesine eklenecek.',
        registry,
      })
    } else if (teamMemberId) {
      // Video editör için ContentRegistry oluştur
      const teamMember = await prisma.teamMember.findUnique({
        where: { id: teamMemberId },
        select: { id: true, name: true },
      })

      if (!teamMember) {
        return NextResponse.json(
          { error: 'Ekip üyesi bulunamadı' },
          { status: 404 }
        )
      }

      // ContentRegistry'ye kaydet (İçerik Merkezi'nde görünecek)
      const registry = await prisma.contentRegistry.create({
        data: {
          title: workName,
          description: description || null,
          editorId: teamMemberId,
          contentType: workType, // SHORT_VIDEO, LONG_VIDEO
          status: 'EDITING', // Admin onayı bekliyor
          editPrice: 0, // Admin dolduracak
          editPaid: false,
          notes: `Video kurgu işi gönderildi: ${workType === 'SHORT_VIDEO' ? 'Kısa Video' : 'Uzun Video'}`,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'İş gönderildi! Admin onayladığında ödeme listesine eklenecek.',
        registry,
      })
    }

    return NextResponse.json(
      { error: 'Geçersiz kullanıcı tipi' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error submitting work:', error)
    return NextResponse.json(
      { error: error.message || 'İş gönderilemedi' },
      { status: 500 }
    )
  }
}
