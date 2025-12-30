import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'all' // all, monthly, total
    const format = searchParams.get('format') || 'csv' // csv, json

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    
    // Finansal kayıtları çek
    let financialRecords
    if (type === 'monthly') {
      financialRecords = await prisma.financialRecord.findMany({
        where: { date: { gte: monthStart } },
        include: { streamer: true },
        orderBy: { date: 'asc' }, // Eski → Yeni sıralama
      })
    } else {
      financialRecords = await prisma.financialRecord.findMany({
        include: { streamer: true },
        orderBy: { date: 'asc' }, // Eski → Yeni sıralama
      })
    }

    // Yayınları çek
    let streams
    if (type === 'monthly') {
      streams = await prisma.stream.findMany({
        where: { date: { gte: monthStart } },
        include: { streamer: true },
        orderBy: { date: 'asc' }, // Eski → Yeni sıralama
      })
    } else {
      streams = await prisma.stream.findMany({
        include: { streamer: true },
        orderBy: { date: 'asc' }, // Eski → Yeni sıralama
      })
    }

    // İçerikleri çek
    let contents
    if (type === 'monthly') {
      contents = await prisma.content.findMany({
        where: { publishDate: { gte: monthStart } },
        orderBy: { publishDate: 'asc' }, // Eski → Yeni sıralama
      })
    } else {
      contents = await prisma.content.findMany({
        orderBy: { publishDate: 'asc' }, // Eski → Yeni sıralama
      })
    }

    if (format === 'csv') {
      // CSV formatında döndür
      let csv = ''

      // Finansal Kayıtlar
      csv += '=== FİNANSAL KAYITLAR ===\n'
      csv += 'Tarih,Tip,Kategori,Açıklama,Tutar,Yayıncı\n'
      financialRecords.forEach((record) => {
        csv += `${new Date(record.date).toLocaleDateString('tr-TR')},${record.type === 'income' ? 'Gelir' : 'Gider'},${record.category},${record.description || ''},${record.amount},${record.streamer?.name || ''}\n`
      })

      csv += '\n=== YAYINLAR ===\n'
      csv += 'Tarih,Yayıncı,Maç,Firmalar,Süre (Saat),Maliyet\n'
      streams.forEach((stream) => {
        const teams = stream.teams ? JSON.parse(stream.teams).join('; ') : ''
        csv += `${new Date(stream.date).toLocaleDateString('tr-TR')},${stream.streamer.name},${stream.matchInfo || ''},${teams},${stream.duration},${stream.cost}\n`
      })

      csv += '\n=== İÇERİKLER ===\n'
      csv += 'Tarih,Başlık,Platform,Tip,Görüntülenme,Beğeni,Yorum,Paylaşım\n'
      contents.forEach((content) => {
        csv += `${new Date(content.publishDate).toLocaleDateString('tr-TR')},${content.title},${content.platform},${content.type},${content.views},${content.likes},${content.comments},${content.shares}\n`
      })

      // Özet istatistikler
      const totalIncome = financialRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
      const totalExpense = financialRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
      const totalStreamCost = streams.reduce((sum, s) => sum + s.cost, 0)
      
      csv += '\n=== ÖZET İSTATİSTİKLER ===\n'
      csv += `Toplam Gelir,${totalIncome}\n`
      csv += `Toplam Gider,${totalExpense}\n`
      csv += `Toplam Yayın Maliyeti,${totalStreamCost}\n`
      csv += `Toplam Gider (Gider + Yayın),${totalExpense + totalStreamCost}\n`
      csv += `Net Gelir,${totalIncome - totalExpense - totalStreamCost}\n`
      csv += `Toplam Yayın Sayısı,${streams.length}\n`
      csv += `Toplam İçerik Sayısı,${contents.length}\n`

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="arhaval-rapor-${type}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else {
      // JSON formatında döndür
      return NextResponse.json({
        type,
        date: new Date().toISOString(),
        financialRecords,
        streams,
        contents,
        summary: {
          totalIncome: financialRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0),
          totalExpense: financialRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0),
          totalStreamCost: streams.reduce((sum, s) => sum + s.cost, 0),
          totalStreams: streams.length,
          totalContent: contents.length,
        },
      })
    }
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Veri dışa aktarılamadı' },
      { status: 500 }
    )
  }
}



