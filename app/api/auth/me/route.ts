import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value

    if (!userId) {
      return NextResponse.json({ user: null })
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      })

      return NextResponse.json({ user })
    } catch (dbError: any) {
      // Database bağlantı hatası durumunda null döndür
      if (dbError.message?.includes('Tenant') || dbError.message?.includes('user not found') || dbError.message?.includes('FATAL')) {
        console.error('Database connection error:', dbError.message)
        return NextResponse.json({ user: null })
      }
      console.error('Database error in /api/auth/me:', dbError)
      // Database hatası olsa bile null döndür, sayfa çökmesin
      return NextResponse.json({ user: null })
    }
  } catch (error: any) {
    console.error('Error in /api/auth/me:', error)
    // Her durumda null döndür, sayfa çökmesin
    return NextResponse.json({ user: null })
  }
}









