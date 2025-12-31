import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// PATCH - Yapılacak tamamlandı/tamamlanmadı olarak işaretle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)

    const currentTodo = await prisma.todo.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!currentTodo) {
      return NextResponse.json(
        { error: 'Yapılacak bulunamadı' },
        { status: 404 }
      )
    }

    const todo = await prisma.todo.update({
      where: { id: resolvedParams.id },
      data: {
        completed: !currentTodo.completed,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ todo })
  } catch (error) {
    console.error('Error toggling todo:', error)
    return NextResponse.json(
      { error: 'Yapılacak güncellenemedi' },
      { status: 500 }
    )
  }
}

