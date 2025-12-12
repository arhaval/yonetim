import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getContentCreatorByEmail } from '@/lib/auth'

// Email'in veritabanında olup olmadığını kontrol et
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email gereklidir' },
        { status: 400 }
      )
    }

    // Email'i normalize et
    const normalizedEmail = email.toLowerCase().trim()

    // Creator'ı bul
    const creator = await getContentCreatorByEmail(normalizedEmail)

    // Tüm creator'ları listele (debug için)
    const allCreators = await prisma.contentCreator.findMany({
      select: { 
        id: true,
        email: true, 
        name: true,
        isActive: true,
        password: true,
      },
    })
    
    console.log('Checking email:', normalizedEmail)
    console.log('All creators:', allCreators.map(c => ({ 
      email: c.email, 
      normalized: c.email?.toLowerCase().trim(),
      matches: c.email?.toLowerCase().trim() === normalizedEmail 
    })))

    if (creator) {
      return NextResponse.json({
        found: true,
        creator: {
          id: creator.id,
          email: creator.email,
          name: creator.name,
          isActive: creator.isActive,
          hasPassword: !!creator.password,
        },
        allCreators: allCreators.map(c => ({
          email: c.email,
          name: c.name,
          isActive: c.isActive,
          hasPassword: !!c.password,
        })),
      })
    } else {
      return NextResponse.json({
        found: false,
        searchedEmail: normalizedEmail,
        allCreators: allCreators.map(c => ({
          email: c.email,
          name: c.name,
          isActive: c.isActive,
          hasPassword: !!c.password,
        })),
        message: 'Bu email veritabanında bulunamadı',
      })
    }
  } catch (error: any) {
    console.error('Check email error:', error)
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

