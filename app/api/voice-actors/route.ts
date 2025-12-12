import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function GET() {
  try {
    const voiceActors = await prisma.voiceActor.findMany({
      include: {
        _count: {
          select: {
            contents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(voiceActors)
  } catch (error) {
    console.error('Error fetching voice actors:', error)
    return NextResponse.json(
      { error: 'Seslendirmenler getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, email, password, phone, profilePhoto, notes } = data

    if (!name) {
      return NextResponse.json(
        { error: 'İsim gereklidir' },
        { status: 400 }
      )
    }

    // Eğer email ve password verilmişse, hash'le
    let hashedPassword = null
    if (password) {
      hashedPassword = await hashPassword(password)
    }

    // Email'i normalize et (küçük harfe çevir ve trim yap)
    const normalizedEmail = email ? email.toLowerCase().trim() : null

    const voiceActor = await prisma.voiceActor.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || null,
        profilePhoto: profilePhoto || null,
        notes: notes || null,
        isActive: true,
      },
    })

    return NextResponse.json(voiceActor)
  } catch (error: any) {
    console.error('Error creating voice actor:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu email zaten kullanılıyor' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Seslendirmen oluşturulamadı' },
      { status: 500 }
    )
  }
}



