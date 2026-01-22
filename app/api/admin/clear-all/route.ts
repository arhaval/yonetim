import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tüm verileri sil (Admin API)
export async function POST() {
  try {
    // Tüm tabloları temizle
    await prisma.workSubmission.deleteMany({})
    await prisma.extraWorkRequest.deleteMany({})
    await prisma.contentRegistry.deleteMany({})
    await prisma.stream.deleteMany({})
    await prisma.content.deleteMany({})
    await prisma.financialRecord.deleteMany({})
    await prisma.payment.deleteMany({})
    await prisma.payout.deleteMany({})
    await prisma.socialMediaStats.deleteMany({})
    await prisma.auditLog.deleteMany({})
    await prisma.teamMember.deleteMany({})
    await prisma.voiceActor.deleteMany({})
    await prisma.streamer.deleteMany({})
    await prisma.contentCreator.deleteMany({})

    return NextResponse.json({ 
      success: true, 
      message: 'Tüm veriler silindi!' 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

