import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// GET - Yapılacak detayını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const todo = await prisma.todo.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!todo) {
      return NextResponse.json(
        { error: 'Yapılacak bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ todo })
  } catch (error) {
    console.error('Error fetching todo:', error)
    return NextResponse.json(
      { error: 'Yapılacak getirilemedi' },
      { status: 500 }
    )
  }
}

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
    const body = await request.json()
    const { text, notes, completed } = body

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (text !== undefined) {
      if (!text || !text.trim()) {
        return NextResponse.json(
          { error: 'Metin gereklidir' },
          { status: 400 }
        )
      }
      updateData.text = text.trim()
    }

    if (notes !== undefined) {
      updateData.notes = notes || null
    }

    if (completed !== undefined) {
      updateData.completed = completed
    }

    const todo = await prisma.todo.update({
      where: { id: resolvedParams.id },
      data: updateData,
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

