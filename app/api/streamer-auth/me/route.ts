import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const streamerId = cookieStore.get('streamer-id')?.value

    if (!streamerId) {
      return NextResponse.json({ streamer: null })
    }

    try {
      const streamer = await prisma.streamer.findUnique({
        where: { id: streamerId },
        select: {
          id: true,
          email: true,
          name: true,
          profilePhoto: true,
          isActive: true,
        },
      })

      if (!streamer || !streamer.isActive) {
        return NextResponse.json({ streamer: null })
      }

      return NextResponse.json({ streamer })
    } catch (dbError: any) {
      // Database bağlantı hatası durumunda null döndür
      if (dbError.message?.includes('Tenant') || dbError.message?.includes('user not found') || dbError.message?.includes('FATAL')) {
        console.error('Database connection error in /api/streamer-auth/me:', dbError.message)
        return NextResponse.json({ streamer: null })
      }
      console.error('Database error in /api/streamer-auth/me:', dbError)
      // Database hatası olsa bile null döndür, sayfa çökmesin
      return NextResponse.json({ streamer: null })
    }
  } catch (error: any) {
    console.error('Error in /api/streamer-auth/me:', error)
    // Her durumda null döndür, sayfa çökmesin
    return NextResponse.json({ streamer: null })
  }
}



















