import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format, startOfMonth, endOfMonth, parseISO, subMonths } from 'date-fns'
import { tr } from 'date-fns/locale'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || format(new Date(), 'yyyy-MM')
    
    const startDate = startOfMonth(parseISO(`${month}-01`))
    const endDate = endOfMonth(startDate)
    
    // Önceki ay
    const prevStartDate = startOfMonth(subMonths(startDate, 1))
    const prevEndDate = endOfMonth(prevStartDate)
    
    // Verileri çek
    const [
      currentFinancials,
      prevFinancials,
      currentStreams,
      prevStreams,
      currentVoiceovers,
      prevVoiceovers,
      currentContent,
      prevContent,
      teamMembers,
      voiceActors,
      streamers,
    ] = await Promise.all([
      // Bu ay finansal
      prisma.financialRecord.findMany({
        where: { date: { gte: startDate, lte: endDate } },
      }),
      // Önceki ay finansal
      prisma.financialRecord.findMany({
        where: { date: { gte: prevStartDate, lte: prevEndDate } },
      }),
      // Bu ay yayınlar
      prisma.stream.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        include: { streamer: { select: { name: true } } },
      }),
      // Önceki ay yayınlar
      prisma.stream.findMany({
        where: { date: { gte: prevStartDate, lte: prevEndDate } },
      }),
      // Bu ay seslendirmeler
      prisma.voiceoverScript.findMany({
        where: { 
          createdAt: { gte: startDate, lte: endDate },
          status: { in: ['APPROVED', 'PAID'] },
        },
      }),
      // Önceki ay seslendirmeler
      prisma.voiceoverScript.findMany({
        where: { 
          createdAt: { gte: prevStartDate, lte: prevEndDate },
          status: { in: ['APPROVED', 'PAID'] },
        },
      }),
      // Bu ay içerikler
      prisma.content.count({
        where: { publishDate: { gte: startDate, lte: endDate } },
      }),
      // Önceki ay içerikler
      prisma.content.count({
        where: { publishDate: { gte: prevStartDate, lte: prevEndDate } },
      }),
      // Ekip üyeleri
      prisma.teamMember.count({ where: { isActive: true } }),
      // Seslendirmenler
      prisma.voiceActor.count({ where: { isActive: true } }),
      // Yayıncılar
      prisma.streamer.count({ where: { isActive: true } }),
    ])
    
    // Hesaplamalar
    const currentIncome = currentFinancials.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
    const currentExpense = currentFinancials.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
    const currentStreamRevenue = currentStreams.reduce((s, r) => s + (r.totalRevenue || 0), 0)
    const currentStreamCost = currentStreams.reduce((s, r) => s + (r.streamerEarning || 0), 0)
    const currentVoiceoverCost = currentVoiceovers.reduce((s, r) => s + (r.price || 0), 0)
    
    const prevIncome = prevFinancials.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
    const prevExpense = prevFinancials.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
    const prevStreamRevenue = prevStreams.reduce((s, r) => s + (r.totalRevenue || 0), 0)
    const prevStreamCost = prevStreams.reduce((s, r) => s + (r.streamerEarning || 0), 0)
    const prevVoiceoverCost = prevVoiceovers.reduce((s, r) => s + (r.price || 0), 0)
    
    const totalCurrentIncome = currentIncome + currentStreamRevenue
    const totalCurrentExpense = currentExpense + currentStreamCost + currentVoiceoverCost
    const totalPrevIncome = prevIncome + prevStreamRevenue
    const totalPrevExpense = prevExpense + prevStreamCost + prevVoiceoverCost
    
    const currentNet = totalCurrentIncome - totalCurrentExpense
    const prevNet = totalPrevIncome - totalPrevExpense
    
    // Değişim yüzdeleri
    const incomeChange = totalPrevIncome > 0 ? ((totalCurrentIncome - totalPrevIncome) / totalPrevIncome * 100) : 0
    const expenseChange = totalPrevExpense > 0 ? ((totalCurrentExpense - totalPrevExpense) / totalPrevExpense * 100) : 0
    const netChange = prevNet !== 0 ? ((currentNet - prevNet) / Math.abs(prevNet) * 100) : 0
    const streamCountChange = prevStreams.length > 0 ? ((currentStreams.length - prevStreams.length) / prevStreams.length * 100) : 0
    const voiceoverCountChange = prevVoiceovers.length > 0 ? ((currentVoiceovers.length - prevVoiceovers.length) / prevVoiceovers.length * 100) : 0
    const contentChange = prevContent > 0 ? ((currentContent - prevContent) / prevContent * 100) : 0
    
    // En çok kazanan yayıncılar
    const streamerEarnings: Record<string, { name: string; total: number }> = {}
    currentStreams.forEach(s => {
      const name = s.streamer?.name || 'Bilinmeyen'
      if (!streamerEarnings[name]) streamerEarnings[name] = { name, total: 0 }
      streamerEarnings[name].total += s.streamerEarning || 0
    })
    const topStreamers = Object.values(streamerEarnings).sort((a, b) => b.total - a.total).slice(0, 5)
    
    // Kategori bazlı giderler
    const categoryExpenses: Record<string, number> = {}
    currentFinancials.filter(r => r.type === 'expense').forEach(r => {
      const cat = r.category || 'Diğer'
      categoryExpenses[cat] = (categoryExpenses[cat] || 0) + r.amount
    })
    
    const monthLabel = format(startDate, 'MMMM yyyy', { locale: tr })
    const prevMonthLabel = format(prevStartDate, 'MMMM yyyy', { locale: tr })
    
    // AI Özet oluştur
    const insights: string[] = []
    
    // Gelir analizi
    if (incomeChange > 10) {
      insights.push(`📈 Gelirler geçen aya göre %${incomeChange.toFixed(0)} arttı! Harika bir performans.`)
    } else if (incomeChange < -10) {
      insights.push(`📉 Gelirler geçen aya göre %${Math.abs(incomeChange).toFixed(0)} azaldı. Yeni gelir kaynakları değerlendirilebilir.`)
    } else {
      insights.push(`📊 Gelirler geçen ayla benzer seviyede (${incomeChange > 0 ? '+' : ''}${incomeChange.toFixed(0)}%).`)
    }
    
    // Gider analizi
    if (expenseChange > 15) {
      insights.push(`⚠️ Giderler %${expenseChange.toFixed(0)} arttı. Maliyet optimizasyonu düşünülebilir.`)
    } else if (expenseChange < -10) {
      insights.push(`✅ Giderler %${Math.abs(expenseChange).toFixed(0)} azaldı. Maliyet kontrolü başarılı!`)
    }
    
    // Net kar analizi
    if (currentNet > 0 && prevNet > 0 && netChange > 20) {
      insights.push(`🎉 Net kar %${netChange.toFixed(0)} arttı! Mükemmel bir ay geçirdiniz.`)
    } else if (currentNet < 0) {
      insights.push(`🔴 Bu ay zarar edildi. Gelir-gider dengesini gözden geçirin.`)
    } else if (currentNet > 0) {
      insights.push(`💰 Bu ay ${currentNet.toLocaleString('tr-TR')} ₺ net kar elde edildi.`)
    }
    
    // Yayın analizi
    if (currentStreams.length > 0) {
      insights.push(`🎬 ${currentStreams.length} yayın yapıldı${streamCountChange !== 0 ? ` (${streamCountChange > 0 ? '+' : ''}${streamCountChange.toFixed(0)}%)` : ''}.`)
    }
    
    // Seslendirme analizi
    if (currentVoiceovers.length > 0) {
      insights.push(`🎙️ ${currentVoiceovers.length} seslendirme tamamlandı${voiceoverCountChange !== 0 ? ` (${voiceoverCountChange > 0 ? '+' : ''}${voiceoverCountChange.toFixed(0)}%)` : ''}.`)
    }
    
    // İçerik analizi
    if (currentContent > 0) {
      insights.push(`📱 ${currentContent} içerik yayınlandı${contentChange !== 0 ? ` (${contentChange > 0 ? '+' : ''}${contentChange.toFixed(0)}%)` : ''}.`)
    }
    
    // Öneriler
    const recommendations: string[] = []
    
    if (totalCurrentExpense > totalCurrentIncome) {
      recommendations.push('Giderler gelirleri aşıyor. Maliyet azaltma veya gelir artırma stratejileri değerlendirilmeli.')
    }
    
    if (currentStreams.length < prevStreams.length * 0.8) {
      recommendations.push('Yayın sayısı düştü. Yeni yayıncı anlaşmaları veya mevcut yayıncılarla daha fazla iş birliği yapılabilir.')
    }
    
    if (topStreamers.length > 0 && topStreamers[0].total > totalCurrentExpense * 0.3) {
      recommendations.push(`En yüksek ödeme alan yayıncı (${topStreamers[0].name}) toplam giderin %${(topStreamers[0].total / totalCurrentExpense * 100).toFixed(0)}'ini oluşturuyor. Çeşitlendirme düşünülebilir.`)
    }
    
    if (currentVoiceovers.length > prevVoiceovers.length * 1.5) {
      recommendations.push('Seslendirme işleri artıyor. Ek seslendirmen alımı değerlendirilebilir.')
    }
    
    // HTML oluştur
    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>AI Aylık Özet - ${monthLabel}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    h1 { color: #1e40af; margin-bottom: 8px; font-size: 32px; display: flex; align-items: center; gap: 12px; }
    h2 { color: #374151; margin: 32px 0 16px; font-size: 20px; border-left: 4px solid #3b82f6; padding-left: 12px; }
    .subtitle { color: #6b7280; margin-bottom: 32px; font-size: 16px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
    .summary-card { padding: 24px; border-radius: 16px; text-align: center; position: relative; overflow: hidden; }
    .summary-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; }
    .summary-card.income { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); }
    .summary-card.income::before { background: linear-gradient(90deg, #22c55e, #16a34a); }
    .summary-card.expense { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); }
    .summary-card.expense::before { background: linear-gradient(90deg, #ef4444, #dc2626); }
    .summary-card.net { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); }
    .summary-card.net::before { background: linear-gradient(90deg, #3b82f6, #2563eb); }
    .summary-card .label { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
    .summary-card .value { font-size: 28px; font-weight: bold; }
    .summary-card .change { font-size: 12px; margin-top: 8px; padding: 4px 8px; border-radius: 20px; display: inline-block; }
    .change.positive { background: #dcfce7; color: #16a34a; }
    .change.negative { background: #fee2e2; color: #dc2626; }
    .insights { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 16px; padding: 24px; margin-bottom: 32px; }
    .insight-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #e0e7ff; }
    .insight-item:last-child { border-bottom: none; }
    .insight-icon { font-size: 20px; }
    .insight-text { color: #374151; line-height: 1.6; }
    .recommendations { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 24px; }
    .recommendation-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #fcd34d; }
    .recommendation-item:last-child { border-bottom: none; }
    .top-list { display: grid; gap: 8px; }
    .top-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f9fafb; border-radius: 8px; }
    .top-item .rank { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
    .top-item .name { flex: 1; margin-left: 12px; font-weight: 500; }
    .top-item .amount { font-weight: bold; color: #dc2626; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 14px; }
    @media print { body { padding: 0; background: white; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <h1>🤖 AI Aylık Özet</h1>
    <p class="subtitle">${monthLabel} - Arhaval Denetim Merkezi</p>
    
    <div class="summary-grid">
      <div class="summary-card income">
        <div class="label">Toplam Gelir</div>
        <div class="value" style="color: #16a34a;">${totalCurrentIncome.toLocaleString('tr-TR')} ₺</div>
        <div class="change ${incomeChange >= 0 ? 'positive' : 'negative'}">
          ${incomeChange >= 0 ? '↑' : '↓'} ${Math.abs(incomeChange).toFixed(1)}%
        </div>
      </div>
      <div class="summary-card expense">
        <div class="label">Toplam Gider</div>
        <div class="value" style="color: #dc2626;">${totalCurrentExpense.toLocaleString('tr-TR')} ₺</div>
        <div class="change ${expenseChange <= 0 ? 'positive' : 'negative'}">
          ${expenseChange >= 0 ? '↑' : '↓'} ${Math.abs(expenseChange).toFixed(1)}%
        </div>
      </div>
      <div class="summary-card net">
        <div class="label">Net Kar/Zarar</div>
        <div class="value" style="color: ${currentNet >= 0 ? '#2563eb' : '#dc2626'};">${currentNet.toLocaleString('tr-TR')} ₺</div>
        <div class="change ${netChange >= 0 ? 'positive' : 'negative'}">
          ${netChange >= 0 ? '↑' : '↓'} ${Math.abs(netChange).toFixed(1)}%
        </div>
      </div>
    </div>
    
    <h2>📊 Aylık Analiz</h2>
    <div class="insights">
      ${insights.map(insight => `
        <div class="insight-item">
          <span class="insight-text">${insight}</span>
        </div>
      `).join('')}
    </div>
    
    ${recommendations.length > 0 ? `
      <h2>💡 Öneriler</h2>
      <div class="recommendations">
        ${recommendations.map(rec => `
          <div class="recommendation-item">
            <span class="insight-icon">💡</span>
            <span class="insight-text">${rec}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    ${topStreamers.length > 0 ? `
      <h2>🏆 En Çok Ödeme Alan Yayıncılar</h2>
      <div class="top-list">
        ${topStreamers.map((s, i) => `
          <div class="top-item">
            <span class="rank">${i + 1}</span>
            <span class="name">${s.name}</span>
            <span class="amount">${s.total.toLocaleString('tr-TR')} ₺</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    <h2>📈 Karşılaştırma: ${monthLabel} vs ${prevMonthLabel}</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Metrik</th>
          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">${prevMonthLabel}</th>
          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">${monthLabel}</th>
          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Değişim</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Toplam Gelir</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${totalPrevIncome.toLocaleString('tr-TR')} ₺</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${totalCurrentIncome.toLocaleString('tr-TR')} ₺</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: ${incomeChange >= 0 ? '#16a34a' : '#dc2626'};">${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}%</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Toplam Gider</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${totalPrevExpense.toLocaleString('tr-TR')} ₺</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${totalCurrentExpense.toLocaleString('tr-TR')} ₺</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: ${expenseChange <= 0 ? '#16a34a' : '#dc2626'};">${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}%</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Yayın Sayısı</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${prevStreams.length}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${currentStreams.length}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: ${streamCountChange >= 0 ? '#16a34a' : '#dc2626'};">${streamCountChange >= 0 ? '+' : ''}${streamCountChange.toFixed(1)}%</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Seslendirme Sayısı</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${prevVoiceovers.length}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${currentVoiceovers.length}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: ${voiceoverCountChange >= 0 ? '#16a34a' : '#dc2626'};">${voiceoverCountChange >= 0 ? '+' : ''}${voiceoverCountChange.toFixed(1)}%</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">İçerik Sayısı</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${prevContent}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${currentContent}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: ${contentChange >= 0 ? '#16a34a' : '#dc2626'};">${contentChange >= 0 ? '+' : ''}${contentChange.toFixed(1)}%</td>
        </tr>
      </tbody>
    </table>
    
    <div class="footer">
      <p>Bu rapor ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: tr })} tarihinde AI tarafından oluşturulmuştur.</p>
      <p>Arhaval Denetim Merkezi</p>
    </div>
  </div>
</body>
</html>
    `
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="ai-ozet-${month}.html"`,
      },
    })
    
  } catch (error) {
    console.error('Error generating AI summary:', error)
    return NextResponse.json({ error: 'Rapor oluşturulamadı' }, { status: 500 })
  }
}

