import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

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
    
    // Şifre varsa hash'le
    let hashedPassword = null
    if (data.password && data.password.trim()) {
      hashedPassword = await hashPassword(data.password)
    }

    // Email'i normalize et (küçük harfe çevir ve trim yap)
    const normalizedEmail = data.email ? data.email.toLowerCase().trim() : null
    
    if (!normalizedEmail || normalizedEmail === '') {
      return NextResponse.json(
        { error: 'Email gereklidir' },
        { status: 400 }
      )
    }

    // Aynı email ile kayıtlı creator var mı kontrol et (case-insensitive)
    const existingCreators = await prisma.contentCreator.findMany({
      where: { email: { not: null } },
    })
    
    const existingCreator = existingCreators.find(
      c => c.email && c.email.toLowerCase().trim() === normalizedEmail
    )

    if (existingCreator) {
      // Mevcut kaydı güncelle
      const updatedCreator = await prisma.contentCreator.update({
        where: { id: existingCreator.id },
        data: {
          name: data.name,
          email: normalizedEmail, // Email'i normalize edilmiş haliyle güncelle
          password: hashedPassword || existingCreator.password, // Şifre verilmişse güncelle, yoksa eski şifreyi koru
          profilePhoto: data.profilePhoto || existingCreator.profilePhoto,
          phone: data.phone || existingCreator.phone,
          platform: data.platform || existingCreator.platform,
          channelUrl: data.channelUrl || existingCreator.channelUrl,
          isActive: data.isActive !== undefined ? data.isActive : existingCreator.isActive,
          notes: data.notes || existingCreator.notes,
        },
      })
      
      return NextResponse.json({
        message: 'İçerik üreticisi güncellendi',
        creator: updatedCreator,
      })
    }

    const creator = await prisma.contentCreator.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        password: hashedPassword,
        profilePhoto: data.profilePhoto || null,
        phone: data.phone || null,
        platform: data.platform || null,
        channelUrl: data.channelUrl || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        notes: data.notes || null,
      },
    })

    return NextResponse.json(creator)
  } catch (error: any) {
    console.error('Error creating content creator:', error)
    return NextResponse.json(
      { error: error.message || 'İçerik üreticisi oluşturulamadı' },
      { status: 500 }
    )
  }
}

