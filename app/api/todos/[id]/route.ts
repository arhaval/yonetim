import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// PATCH - Yapılacak güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const { text } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Metin gereklidir' },
        { status: 400 }
      )
    }

    const todo = await prisma.todo.update({
      where: { id: resolvedParams.id },
      data: {
        text: text.trim(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ todo })
  } catch (error) {
    console.error('Error updating todo:', error)
    return NextResponse.json(
      { error: 'Yapılacak güncellenemedi' },
      { status: 500 }
    )
  }
}

// DELETE - Yapılacak sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)

    await prisma.todo.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting todo:', error)
    return NextResponse.json(
      { error: 'Yapılacak silinemedi' },
      { status: 500 }
    )
  }
}

