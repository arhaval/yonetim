import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const creators = await prisma.contentCreator.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            contents: true,
            scripts: true,
          },
        },
      },
    })
    return NextResponse.json(creators)
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

