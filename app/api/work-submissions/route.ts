import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * İş gönderme endpoint'i
 * Seslendirmen ve video editörler yaptıkları işleri buradan gönderir
 * Admin onayladığında ödeme listesine eklenir
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
      // Seslendirmen için VoiceoverScript oluştur (admin onayı bekliyor)
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

      // VoiceoverScript oluştur (metin olmadan, sadece iş kaydı olarak)
      const script = await prisma.voiceoverScript.create({
        data: {
          title: workName,
          text: description || 'Seslendirme işi',
          voiceActorId: voiceActorId,
          contentType: workType, // SHORT_VOICE, LONG_VOICE
          status: 'WAITING_VOICE', // Admin onayı bekliyor
          price: 0, // Admin dolduracak
          notes: `İş gönderimi: ${workType}`,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'İş gönderildi! Admin onayladığında ödeme listesine eklenecek.',
        script,
      })
    } else if (teamMemberId) {
      // Video editör için TeamPayment oluştur
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

      const payment = await prisma.teamPayment.create({
        data: {
          teamMemberId: teamMemberId,
          amount: 0, // Admin dolduracak
          type: workType, // SHORT_VIDEO, LONG_VIDEO
          period: new Date().toISOString().slice(0, 7), // YYYY-MM
          description: `${workName}${description ? ' - ' + description : ''}`,
          paidAt: null, // Henüz ödenmedi
        },
      })

      return NextResponse.json({
        success: true,
        message: 'İş gönderildi! Admin onayladığında ödeme listesine eklenecek.',
        payment,
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

