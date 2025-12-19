import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const plans = await prisma.monthlyPlan.findMany({
      where: { month: currentMonth },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Planlar getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const plan = await prisma.monthlyPlan.upsert({
      where: {
        type_month: {
          type: data.type,
          month: data.month,
        },
      },
      update: {
        title: data.title,
        target: data.target,
      },
      create: {
        title: data.title,
        target: data.target,
        month: data.month,
        type: data.type,
      },
    })
    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error creating/updating plan:', error)
    return NextResponse.json(
      { error: 'Plan kaydedilemedi' },
      { status: 500 }
    )
  }
}

















