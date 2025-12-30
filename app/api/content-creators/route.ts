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
    
    const creators = await prisma.contentCreator.findMany({
      select: {
        id: true,
        name: true,
        profilePhoto: true,
        email: true,
        phone: true,
        iban: true,
        platform: true,
        channelUrl: true,
        isActive: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        // _count kaldırıldı - performans için
      },
      where: {
        isActive: true,
      },
      orderBy: { createdAt: 'asc' }, // Eski → Yeni sıralama
      take: limit,
      skip: offset,
    })
    
    const total = await prisma.contentCreator.count({
      where: { isActive: true },
    })
    
    const duration = Date.now() - startTime
    console.log(`[Content Creators API] Fetched ${creators.length} creators in ${duration}ms`)
    
    return NextResponse.json(creators, {
      headers: {
        'X-Total-Count': total.toString(),
        'X-Limit': limit.toString(),
        'X-Offset': offset.toString(),
      },
    })
  } catch (error) {
    console.error('Error fetching content creators:', error)
    return NextResponse.json(
      { error: 'İçerik üreticileri getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('Creating content creator:', {
      name: data.name,
      email: data.email,
      hasPassword: !!data.password,
    })
    
    // İsim kontrolü
    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { error: 'İsim gereklidir' },
        { status: 400 }
      )
    }
    
    // Email'i normalize et (küçük harfe çevir ve trim yap)
    const normalizedEmail = data.email ? data.email.toLowerCase().trim() : null
    
    if (!normalizedEmail || normalizedEmail === '') {
      return NextResponse.json(
        { error: 'Email gereklidir' },
        { status: 400 }
      )
    }

    // Şifre kontrolü - email varsa şifre de zorunlu
    if (!data.password || !data.password.trim()) {
      return NextResponse.json(
        { error: 'Şifre gereklidir' },
        { status: 400 }
      )
    }
    
    // Şifre hash'le
    const hashedPassword = await hashPassword(data.password.trim())

    // Aynı email ile kayıtlı creator var mı kontrol et (case-insensitive)
    const existingCreators = await prisma.contentCreator.findMany({
      where: { email: { not: null } },
    })
    
    const existingCreator = existingCreators.find(
      c => c.email && c.email.toLowerCase().trim() === normalizedEmail
    )

    if (existingCreator) {
      console.log('Updating existing creator:', existingCreator.id)
      // Mevcut kaydı güncelle
      const updatedCreator = await prisma.contentCreator.update({
        where: { id: existingCreator.id },
        data: {
          name: data.name.trim(),
          email: normalizedEmail, // Email'i normalize edilmiş haliyle güncelle
          password: hashedPassword, // Şifreyi her zaman güncelle (yeni kayıt için zorunlu)
          profilePhoto: data.profilePhoto || existingCreator.profilePhoto,
          phone: data.phone?.trim() || existingCreator.phone,
          iban: data.iban?.trim() || existingCreator.iban,
          platform: data.platform || existingCreator.platform,
          channelUrl: data.channelUrl?.trim() || existingCreator.channelUrl,
          isActive: data.isActive !== undefined ? data.isActive : existingCreator.isActive,
          notes: data.notes?.trim() || existingCreator.notes,
        },
      })
      
      console.log('Creator updated successfully:', updatedCreator.id)
      return NextResponse.json({
        message: 'İçerik üreticisi güncellendi',
        creator: updatedCreator,
      })
    }

    console.log('Creating new creator...')
    const creator = await prisma.contentCreator.create({
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        profilePhoto: data.profilePhoto || null,
        phone: data.phone?.trim() || null,
        iban: data.iban?.trim() || null,
        platform: data.platform || null,
        channelUrl: data.channelUrl?.trim() || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        notes: data.notes?.trim() || null,
      },
    })

    console.log('Creator created successfully:', creator.id)
    return NextResponse.json({
      message: 'İçerik üreticisi oluşturuldu',
      creator: creator,
    })
  } catch (error: any) {
    console.error('Error creating content creator:', error)
    return NextResponse.json(
      { error: error.message || 'İçerik üreticisi oluşturulamadı' },
      { status: 500 }
    )
  }
}

