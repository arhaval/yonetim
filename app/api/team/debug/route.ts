import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Tüm team member'ları çek (avatar kolonu yok, select ile belirtiyoruz)
    const allMembers = await prisma.teamMember.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        iban: true,
        baseSalary: true,
        isActive: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    
    // Streamer'ları da kontrol et
    const allStreamers = await prisma.streamer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    
    // ContentCreator'ları kontrol et
    const allCreators = await prisma.contentCreator.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    
    // VoiceActor'ları kontrol et
    const allVoiceActors = await prisma.voiceActor.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json({
      teamMembers: {
        count: allMembers.length,
        members: allMembers.map(m => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
        })),
      },
      streamers: {
        count: allStreamers.length,
        members: allStreamers,
      },
      contentCreators: {
        count: allCreators.length,
        members: allCreators,
      },
      voiceActors: {
        count: allVoiceActors.length,
        members: allVoiceActors,
      },
      summary: {
        totalTeamMembers: allMembers.length,
        totalStreamers: allStreamers.length,
        totalContentCreators: allCreators.length,
        totalVoiceActors: allVoiceActors.length,
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      code: error.code,
    }, { status: 500 })
  }
}

