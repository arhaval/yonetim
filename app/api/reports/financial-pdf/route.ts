import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || format(new Date(), 'yyyy-MM')
    
    const startDate = startOfMonth(parseISO(`${month}-01`))
    const endDate = endOfMonth(startDate)
    
    // Tüm finansal verileri çek
    const [
      financialRecords,
      payouts,
      streams,
      voiceoverScripts,
      teamMembers,
      voiceActors,
      streamers,
    ] = await Promise.all([
      // Finansal kayıtlar
      prisma.financialRecord.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
        },
        include: {
          streamer: { select: { name: true } },
          teamMember: { select: { name: true } },
          voiceActor: { select: { name: true } },
          contentCreator: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
      }),
      
      // Ödemeler
      prisma.payout.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        orderBy: { createdAt: 'desc' },
      }),
      
      // Yayınlar
      prisma.stream.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
        },
        include: {
          streamer: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
      }),
      
      // Seslendirme metinleri
      prisma.voiceoverScript.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: { in: ['APPROVED', 'PAID'] },
        },
        include: {
          voiceActor: { select: { name: true } },
          creator: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      
      // Ekip üyeleri
      prisma.teamMember.findMany({
        select: { id: true, name: true, role: true },
      }),
      
      // Seslendirmenler
      prisma.voiceActor.findMany({
        select: { id: true, name: true },
      }),
      
      // Yayıncılar
      prisma.streamer.findMany({
        select: { id: true, name: true },
      }),
    ])
    
    // Hesaplamalar
    const totalIncome = financialRecords
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0)
    
    const totalExpense = financialRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)
    
    const totalStreamCost = streams.reduce((sum, s) => sum + (s.streamerEarning || 0), 0)
    const totalStreamRevenue = streams.reduce((sum, s) => sum + (s.totalRevenue || 0), 0)
    
    const totalVoiceoverCost = voiceoverScripts.reduce((sum, s) => sum + (s.price || 0), 0)
    
    const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0)
    
    // Kişi bazlı ödemeler
    const personPayments: Record<string, { name: string; type: string; total: number; items: any[] }> = {}
    
    // Finansal kayıtlardan
    financialRecords.forEach(record => {
      if (record.type === 'expense') {
        let personId = ''
        let personName = ''
        let personType = ''
        
        if (record.streamerId && record.streamer) {
          personId = record.streamerId
          personName = record.streamer.name
          personType = 'Yayıncı'
        } else if (record.teamMemberId && record.teamMember) {
          personId = record.teamMemberId
          personName = record.teamMember.name
          personType = 'Ekip Üyesi'
        } else if (record.voiceActorId && record.voiceActor) {
          personId = record.voiceActorId
          personName = record.voiceActor.name
          personType = 'Seslendirmen'
        } else if (record.contentCreatorId && record.contentCreator) {
          personId = record.contentCreatorId
          personName = record.contentCreator.name
          personType = 'İçerik Üreticisi'
        }
        
        if (personId) {
          if (!personPayments[personId]) {
            personPayments[personId] = { name: personName, type: personType, total: 0, items: [] }
          }
          personPayments[personId].total += record.amount
          personPayments[personId].items.push({
            date: record.date,
            amount: record.amount,
            category: record.category,
            description: record.description,
          })
        }
      }
    })
    
    // Kategori bazlı giderler
    const categoryExpenses: Record<string, number> = {}
    financialRecords.forEach(record => {
      if (record.type === 'expense') {
        const cat = record.category || 'Diğer'
        categoryExpenses[cat] = (categoryExpenses[cat] || 0) + record.amount
      }
    })
    
    // Kategori bazlı gelirler
    const categoryIncomes: Record<string, number> = {}
    financialRecords.forEach(record => {
      if (record.type === 'income') {
        const cat = record.category || 'Diğer'
        categoryIncomes[cat] = (categoryIncomes[cat] || 0) + record.amount
      }
    })
    
    const monthLabel = format(startDate, 'MMMM yyyy', { locale: tr })
    
    // PDF için HTML oluştur
    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Finansal Rapor - ${monthLabel}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #1e40af; margin-bottom: 8px; font-size: 28px; }
    h2 { color: #374151; margin: 24px 0 12px; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    h3 { color: #6b7280; margin: 16px 0 8px; font-size: 14px; }
    .subtitle { color: #6b7280; margin-bottom: 24px; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
    .summary-card { padding: 20px; border-radius: 8px; text-align: center; }
    .summary-card.income { background: #dcfce7; }
    .summary-card.expense { background: #fee2e2; }
    .summary-card.net { background: #dbeafe; }
    .summary-card .label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
    .summary-card .value { font-size: 24px; font-weight: bold; }
    .summary-card.income .value { color: #16a34a; }
    .summary-card.expense .value { color: #dc2626; }
    .summary-card.net .value { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; color: #374151; }
    tr:hover { background: #f9fafb; }
    .amount { text-align: right; font-weight: 600; }
    .amount.positive { color: #16a34a; }
    .amount.negative { color: #dc2626; }
    .category-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .category-item { display: flex; justify-content: space-between; padding: 8px 12px; background: #f9fafb; border-radius: 6px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
    @media print { body { padding: 0; background: white; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Finansal Rapor</h1>
    <p class="subtitle">${monthLabel} - Arhaval Denetim Merkezi</p>
    
    <div class="summary">
      <div class="summary-card income">
        <div class="label">Toplam Gelir</div>
        <div class="value">${(totalIncome + totalStreamRevenue).toLocaleString('tr-TR')} ₺</div>
      </div>
      <div class="summary-card expense">
        <div class="label">Toplam Gider</div>
        <div class="value">${(totalExpense + totalStreamCost + totalVoiceoverCost).toLocaleString('tr-TR')} ₺</div>
      </div>
      <div class="summary-card net">
        <div class="label">Net Kar/Zarar</div>
        <div class="value">${((totalIncome + totalStreamRevenue) - (totalExpense + totalStreamCost + totalVoiceoverCost)).toLocaleString('tr-TR')} ₺</div>
      </div>
    </div>
    
    <h2>📈 Gelir Kategorileri</h2>
    <div class="category-list">
      ${Object.entries(categoryIncomes).map(([cat, amount]) => `
        <div class="category-item">
          <span>${cat}</span>
          <span class="amount positive">+${amount.toLocaleString('tr-TR')} ₺</span>
        </div>
      `).join('')}
      ${totalStreamRevenue > 0 ? `
        <div class="category-item">
          <span>Yayın Gelirleri</span>
          <span class="amount positive">+${totalStreamRevenue.toLocaleString('tr-TR')} ₺</span>
        </div>
      ` : ''}
    </div>
    
    <h2>📉 Gider Kategorileri</h2>
    <div class="category-list">
      ${Object.entries(categoryExpenses).map(([cat, amount]) => `
        <div class="category-item">
          <span>${cat}</span>
          <span class="amount negative">-${amount.toLocaleString('tr-TR')} ₺</span>
        </div>
      `).join('')}
      ${totalStreamCost > 0 ? `
        <div class="category-item">
          <span>Yayıncı Ödemeleri</span>
          <span class="amount negative">-${totalStreamCost.toLocaleString('tr-TR')} ₺</span>
        </div>
      ` : ''}
      ${totalVoiceoverCost > 0 ? `
        <div class="category-item">
          <span>Seslendirme Ödemeleri</span>
          <span class="amount negative">-${totalVoiceoverCost.toLocaleString('tr-TR')} ₺</span>
        </div>
      ` : ''}
    </div>
    
    <h2>👥 Kişi Bazlı Ödemeler</h2>
    <table>
      <thead>
        <tr>
          <th>Kişi</th>
          <th>Tür</th>
          <th class="amount">Toplam Ödeme</th>
        </tr>
      </thead>
      <tbody>
        ${Object.values(personPayments)
          .sort((a, b) => b.total - a.total)
          .map(person => `
            <tr>
              <td>${person.name}</td>
              <td>${person.type}</td>
              <td class="amount negative">-${person.total.toLocaleString('tr-TR')} ₺</td>
            </tr>
          `).join('')}
      </tbody>
    </table>
    
    ${streams.length > 0 ? `
      <h2>🎬 Yayınlar (${streams.length} adet)</h2>
      <table>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Yayıncı</th>
            <th>Maç</th>
            <th class="amount">Ödeme</th>
          </tr>
        </thead>
        <tbody>
          ${streams.slice(0, 20).map(stream => `
            <tr>
              <td>${format(new Date(stream.date), 'dd MMM', { locale: tr })}</td>
              <td>${stream.streamer?.name || '-'}</td>
              <td>${stream.matchInfo || '-'}</td>
              <td class="amount negative">-${(stream.streamerEarning || 0).toLocaleString('tr-TR')} ₺</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : ''}
    
    ${voiceoverScripts.length > 0 ? `
      <h2>🎙️ Seslendirmeler (${voiceoverScripts.length} adet)</h2>
      <table>
        <thead>
          <tr>
            <th>Başlık</th>
            <th>Seslendirmen</th>
            <th class="amount">Ödeme</th>
          </tr>
        </thead>
        <tbody>
          ${voiceoverScripts.slice(0, 20).map(script => `
            <tr>
              <td>${script.title}</td>
              <td>${script.voiceActor?.name || '-'}</td>
              <td class="amount negative">-${(script.price || 0).toLocaleString('tr-TR')} ₺</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : ''}
    
    <div class="footer">
      <p>Bu rapor ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: tr })} tarihinde oluşturulmuştur.</p>
      <p>Arhaval Denetim Merkezi</p>
    </div>
  </div>
</body>
</html>
    `
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="finansal-rapor-${month}.html"`,
      },
    })
    
  } catch (error) {
    console.error('Error generating financial report:', error)
    return NextResponse.json({ error: 'Rapor oluşturulamadı' }, { status: 500 })
  }
}

