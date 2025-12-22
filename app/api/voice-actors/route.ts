import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// Cache GET requests for 30 seconds
export const revalidate = 30

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const voiceActors = await prisma.voiceActor.findMany({
      select: {
        id: true,
        name: true,
        profilePhoto: true,
        email: true,
        phone: true,
        iban: true,
        isActive: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        // _count kaldırıldı - performans için
      },
      where: {
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })
    
    const total = await prisma.voiceActor.count({
      where: { isActive: true },
    })
    
    const duration = Date.now() - startTime
    console.log(`[Voice Actors API] Fetched ${voiceActors.length} voice actors in ${duration}ms`)
    
    return NextResponse.json(voiceActors, {
      headers: {
        'X-Total-Count': total.toString(),
        'X-Limit': limit.toString(),
        'X-Offset': offset.toString(),
      },
    })
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
    const { name, email, password, phone, iban, profilePhoto, notes } = data

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
        iban: iban?.trim() || null,
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



