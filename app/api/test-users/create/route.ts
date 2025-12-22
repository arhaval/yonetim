import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Test kullanıcıları oluştur (sadece development/test ortamında)
export async function POST(request: NextRequest) {
  try {
    // Sadece admin kullanıcılar bu endpoint'i kullanabilir
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim - Sadece admin kullanıcılar test kullanıcıları oluşturabilir' },
        { status: 403 }
      )
    }

    const testPassword = 'test123456' // Tüm test kullanıcıları için aynı şifre
    const hashedPassword = await hashPassword(testPassword)

    const results: any = {}

    // 1. Admin (viewer rolünde - salt okunur)
    try {
      const adminEmail = 'test-admin@arhaval.com'
      const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
      })

      if (!existingAdmin) {
        const admin = await prisma.user.create({
          data: {
            email: adminEmail,
            password: hashedPassword,
            name: 'Test Admin (Salt Okunur)',
            role: 'viewer', // Salt okunur
          },
        })
        results.admin = {
          email: admin.email,
          password: testPassword,
          name: admin.name,
          role: admin.role,
          id: admin.id,
        }
      } else {
        results.admin = {
          email: existingAdmin.email,
          password: testPassword,
          name: existingAdmin.name,
          role: existingAdmin.role,
          id: existingAdmin.id,
          message: 'Zaten mevcut',
        }
      }
    } catch (error: any) {
      results.admin = { error: error.message }
    }

    // 2. Yayıncı
    try {
      const streamerEmail = 'test-streamer@arhaval.com'
      const existingStreamer = await prisma.streamer.findUnique({
        where: { email: streamerEmail },
      })

      if (!existingStreamer) {
        const streamer = await prisma.streamer.create({
          data: {
            name: 'Test Yayıncı',
            email: streamerEmail,
            password: hashedPassword,
            hourlyRate: 100,
            commissionRate: 10,
            isActive: true,
            notes: 'Test kullanıcısı - Salt okunur',
          },
        })
        results.streamer = {
          email: streamer.email,
          password: testPassword,
          name: streamer.name,
          id: streamer.id,
        }
      } else {
        results.streamer = {
          email: existingStreamer.email,
          password: testPassword,
          name: existingStreamer.name,
          id: existingStreamer.id,
          message: 'Zaten mevcut',
        }
      }
    } catch (error: any) {
      results.streamer = { error: error.message }
    }

    // 3. İçerik Üreticisi
    try {
      const creatorEmail = 'test-creator@arhaval.com'
      const existingCreator = await prisma.contentCreator.findUnique({
        where: { email: creatorEmail },
      })

      if (!existingCreator) {
        const creator = await prisma.contentCreator.create({
          data: {
            name: 'Test İçerik Üreticisi',
            email: creatorEmail,
            password: hashedPassword,
            platform: 'Instagram',
            isActive: true,
            notes: 'Test kullanıcısı - Salt okunur',
          },
        })
        results.contentCreator = {
          email: creator.email,
          password: testPassword,
          name: creator.name,
          id: creator.id,
        }
      } else {
        results.contentCreator = {
          email: existingCreator.email,
          password: testPassword,
          name: existingCreator.name,
          id: existingCreator.id,
          message: 'Zaten mevcut',
        }
      }
    } catch (error: any) {
      results.contentCreator = { error: error.message }
    }

    // 4. Seslendirmen
    try {
      const voiceActorEmail = 'test-voiceactor@arhaval.com'
      const existingVoiceActor = await prisma.voiceActor.findUnique({
        where: { email: voiceActorEmail },
      })

      if (!existingVoiceActor) {
        const voiceActor = await prisma.voiceActor.create({
          data: {
            name: 'Test Seslendirmen',
            email: voiceActorEmail,
            password: hashedPassword,
            isActive: true,
            notes: 'Test kullanıcısı - Salt okunur',
          },
        })
        results.voiceActor = {
          email: voiceActor.email,
          password: testPassword,
          name: voiceActor.name,
          id: voiceActor.id,
        }
      } else {
        results.voiceActor = {
          email: existingVoiceActor.email,
          password: testPassword,
          name: existingVoiceActor.name,
          id: existingVoiceActor.id,
          message: 'Zaten mevcut',
        }
      }
    } catch (error: any) {
      results.voiceActor = { error: error.message }
    }

    return NextResponse.json({
      message: 'Test kullanıcıları oluşturuldu',
      users: results,
      note: 'Tüm kullanıcılar için şifre: test123456',
    })
  } catch (error: any) {
    console.error('Error creating test users:', error)
    return NextResponse.json(
      { error: error.message || 'Test kullanıcıları oluşturulamadı' },
      { status: 500 }
    )
  }
}

