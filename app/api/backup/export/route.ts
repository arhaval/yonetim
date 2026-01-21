import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Dynamic route - force dynamic rendering
export const dynamic = 'force-dynamic'

// Manuel backup export API
export async function GET(request: NextRequest) {
  try {
    // Admin kontrolü (güvenlik için)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.BACKUP_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Tüm verileri topla
    const [
      streamers,
      streams,
      contents,
      financialRecords,
      voiceActors,
      contentCreators,
      teamMembers,
      contentRegistry,
    ] = await Promise.all([
      prisma.streamer.findMany(),
      prisma.stream.findMany(),
      prisma.content.findMany(),
      prisma.financialRecord.findMany(),
      prisma.voiceActor.findMany(),
      prisma.contentCreator.findMany(),
      prisma.teamMember.findMany(),
      prisma.contentRegistry.findMany(),
    ])

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        streamers,
        streams,
        contents,
        financialRecords,
        voiceActors,
        contentCreators,
        teamMembers,
        contentRegistry,
      },
      stats: {
        streamers: streamers.length,
        streams: streams.length,
        contents: contents.length,
        financialRecords: financialRecords.length,
        voiceActors: voiceActors.length,
        contentCreators: contentCreators.length,
        teamMembers: teamMembers.length,
        contentRegistry: contentRegistry.length,
      },
    }

    // JSON olarak döndür
    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="arhaval-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error: any) {
    console.error('Backup error:', error)
    return NextResponse.json(
      { error: 'Backup failed', message: error.message },
      { status: 500 }
    )
  }
}

