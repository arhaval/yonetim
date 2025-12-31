import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// GET - Tüm yapılacakları getir
export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ todos })
  } catch (error) {
    console.error('Error fetching todos:', error)
    return NextResponse.json(
      { error: 'Yapılacaklar getirilemedi' },
      { status: 500 }
    )
  }
}

// POST - Yeni yapılacak ekle
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const { text } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Metin gereklidir' },
        { status: 400 }
      )
    }

    const todo = await prisma.todo.create({
      data: {
        text: text.trim(),
        completed: false,
      },
    })

    return NextResponse.json({ todo })
  } catch (error) {
    console.error('Error creating todo:', error)
    return NextResponse.json(
      { error: 'Yapılacak eklenemedi' },
      { status: 500 }
    )
  }
}

