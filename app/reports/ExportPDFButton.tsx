'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { format, parse } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

interface ExportPDFButtonProps {
  filter: 'monthly' | 'total'
  selectedMonth: string
  stats: {
    streamCount: number
    externalStreamCount: number
    contentCount: number
    income: number
    expense: number
    streamCost: number
    totalStreamerPayments?: number
    totalVoiceActorPayments?: number
  }
  contentStats: {
    totalViews: number
    totalLikes: number
    totalComments: number
    totalShares: number
    totalSaves: number
    totalEngagement: number
  }
  topStreamers: Array<{ id: string; name: string; streamCount: number }>
  topContentByViews: Array<{ id: string; title: string; platform: string; type: string; views: number }>
  topContent: Array<{ id: string; title: string; platform: string; type: string; likes: number }>
  contentByPlatform: Array<{ platform: string; count: number }>
  streamerPayments?: Array<{ id: string; streamerName: string; amount: number; type: string; period: string; description: string | null; paidAt: Date | null }>
  voiceActorPayments?: Array<{ id: string; title: string; voiceActorName: string; price: number | null; paidAt: Date }>
  allContentsDetailed?: Array<{ id: string; title: string; type: string | null; platform: string | null; views: number; likes: number; comments: number; shares: number; saves: number; publishDate: Date }>
  allStreams?: Array<{ id: string; date: Date; matchInfo: string | null; streamerName: string; cost: number; streamerEarning: number }>
  socialMediaGrowth?: Array<{ platform: string; currentCount: number; previousCount: number; growth: number; growthCount: number; target: number | null }>
}

export default function ExportPDFButton({
  filter,
  selectedMonth,
  stats,
  contentStats,
  topStreamers,
  topContentByViews,
  topContent,
  contentByPlatform,
  streamerPayments = [],
  voiceActorPayments = [],
  allContentsDetailed = [],
  allStreams = [],
  socialMediaGrowth = [],
  allExpenses = [],
  allIncomes = [],
}: ExportPDFButtonProps) {
  const [exporting, setExporting] = useState(false)

  // Fiyat formatı - ₺ sembolü
  const formatCurrency = (amount: number) => {
    return `₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const generatePDF = async () => {
    setExporting(true)
    try {
      const jsPDFModule = await import('jspdf')
      const autoTableModule = await import('jspdf-autotable')
      
      if (!jsPDFModule?.default) {
        throw new Error('jsPDF modülü yüklenemedi')
      }
      
      const jsPDF = jsPDFModule.default
      const autoTable = (autoTableModule as any).default || autoTableModule
      
      if (typeof autoTable !== 'function') {
        throw new Error('autoTable fonksiyonu bulunamadı')
      }
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })
      
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPos = 20
      
      const checkPageBreak = (requiredSpace: number = 30) => {
        if (yPos + requiredSpace > pageHeight - 20) {
          doc.addPage()
          yPos = 20
        }
      }

      // Başlık - Daha büyük ve belirgin
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text('AYLIK RAPOR', pageWidth / 2, yPos, { align: 'center' })
      yPos += 12

      // Tarih bilgisi
      doc.setFontSize(14)
      doc.setFont('helvetica', 'normal')
      const monthLabel = format(parse(selectedMonth + '-01', 'yyyy-MM-dd', new Date()), 'MMMM yyyy', { locale: tr })
      doc.text(`Donem: ${monthLabel}`, pageWidth / 2, yPos, { align: 'center' })
      yPos += 15

      // ========== FİNANSAL ÖZET ==========
      checkPageBreak(35)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text('FINANSAL OZET', 14, yPos)
      yPos += 8

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      // Fiyat formatı düzeltildi - ₺ sembolü kullanılıyor
      const formatCurrency = (amount: number) => {
        return `₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }

      const financialData = [
        ['Gelir', formatCurrency(stats.income)],
        ['Gider', formatCurrency(stats.expense)],
        ['Net Kar', formatCurrency(stats.income - stats.expense)],
        ['Yayin Maliyeti', formatCurrency(stats.streamCost)],
      ]

      autoTable(doc, {
        startY: yPos,
        head: [['Kategori', 'Tutar']],
        body: financialData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold', fontSize: 11 },
        bodyStyles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
        styles: { cellPadding: 5 },
      })

      yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30

      // ========== ÖDEMELER ==========
      checkPageBreak(35)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('ODEMELER', 14, yPos)
      yPos += 8

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      const paymentSummary = [
        ['Yayincilara Odenen Toplam', formatCurrency(stats.totalStreamerPayments || 0)],
        ['Seslendirmene Odenen Toplam', formatCurrency(stats.totalVoiceActorPayments || 0)],
        ['Toplam Odeme', formatCurrency((stats.totalStreamerPayments || 0) + (stats.totalVoiceActorPayments || 0))],
      ]

      autoTable(doc, {
        startY: yPos,
        head: [['Kategori', 'Tutar']],
        body: paymentSummary,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 11 },
        bodyStyles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
        styles: { cellPadding: 5 },
      })

      yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30

      // ========== SOSYAL MEDYA BÜYÜMESİ ==========
      if (socialMediaGrowth.length > 0) {
        checkPageBreak(40)
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('SOSYAL MEDYA BUYUMESI', 14, yPos)
        yPos += 8

        const socialMediaData = socialMediaGrowth.map((s) => [
          s.platform,
          s.currentCount.toLocaleString('tr-TR'),
          s.previousCount > 0 ? s.previousCount.toLocaleString('tr-TR') : '-',
          s.growthCount > 0 ? `+${s.growthCount.toLocaleString('tr-TR')}` : s.growthCount.toLocaleString('tr-TR'),
          s.growth !== 0 ? `${s.growth > 0 ? '+' : ''}${s.growth.toFixed(1)}%` : '-',
          s.target ? s.target.toLocaleString('tr-TR') : '-',
        ])

        autoTable(doc, {
          startY: yPos,
          head: [['Platform', 'Mevcut', 'Onceki', 'Artis', 'Buyume %', 'Hedef']],
          body: socialMediaData,
          theme: 'striped',
          headStyles: { fillColor: [168, 85, 247], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
          styles: { cellPadding: 3, overflow: 'linebreak' },
          columnStyles: { 
            0: { cellWidth: 35 }, 
            1: { cellWidth: 30 }, 
            2: { cellWidth: 30 }, 
            3: { cellWidth: 25 }, 
            4: { cellWidth: 25 },
            5: { cellWidth: 25 },
          },
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30
      }

      // Yayıncılara Ödenen Detaylar (sadece özet)
      if (streamerPayments.length > 0) {
        checkPageBreak(40)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Yayincilara Odenen Ucretler (Ozet)', 14, yPos)
        yPos += 8

        const streamerPaymentData = streamerPayments.slice(0, 15).map((p) => [
          p.streamerName.length > 20 ? p.streamerName.substring(0, 20) + '...' : p.streamerName,
          p.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }),
          p.paidAt ? format(new Date(p.paidAt), 'dd.MM.yyyy', { locale: tr }) : '-',
        ])

        autoTable(doc, {
          startY: yPos,
          head: [['Yayinci', 'Tutar', 'Tarih']],
          body: streamerPaymentData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
          styles: { cellPadding: 3, overflow: 'linebreak' },
          columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 40 }, 2: { cellWidth: 40 } },
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30
      }

      // Seslendirmene Ödenen Detaylar (sadece özet)
      if (voiceActorPayments.length > 0) {
        checkPageBreak(40)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Seslendirmene Odenen Ucretler (Ozet)', 14, yPos)
        yPos += 8

        const voiceActorPaymentData = voiceActorPayments.slice(0, 15).map((v) => [
          v.voiceActorName.length > 20 ? v.voiceActorName.substring(0, 20) + '...' : v.voiceActorName,
          formatCurrency(v.price || 0),
          v.title.length > 25 ? v.title.substring(0, 25) + '...' : v.title,
        ])

        autoTable(doc, {
          startY: yPos,
          head: [['Seslendirmen', 'Tutar', 'Proje']],
          body: voiceActorPaymentData,
          theme: 'striped',
          headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
          styles: { cellPadding: 3, overflow: 'linebreak' },
          columnStyles: { 0: { cellWidth: 45 }, 1: { cellWidth: 35 }, 2: { cellWidth: 60 } },
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30
      }

      // ========== YAYINLAR ==========
      checkPageBreak(35)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('YAYINLAR', 14, yPos)
      yPos += 8

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      const streamData = [
        ['Toplam Yayin', stats.streamCount.toString()],
        ['Dis Yayin', stats.externalStreamCount.toString()],
        ['Toplam Yayin Maliyeti', formatCurrency(stats.streamCost)],
      ]

      autoTable(doc, {
        startY: yPos,
          head: [['Kategori', 'Deger']],
        body: streamData,
        theme: 'striped',
        headStyles: { fillColor: [236, 72, 153], textColor: 255, fontStyle: 'bold', fontSize: 11 },
        bodyStyles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
        styles: { cellPadding: 5 },
      })

      yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30

      // ========== İÇERİKLER ==========
      checkPageBreak(40)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('ICERIKLER', 14, yPos)
      yPos += 8

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      const contentData = [
        ['Icerik Sayisi', stats.contentCount.toString()],
        ['Toplam Goruntulenme', contentStats.totalViews.toLocaleString('tr-TR')],
        ['Toplam Begeni', contentStats.totalLikes.toLocaleString('tr-TR')],
        ['Toplam Yorum', contentStats.totalComments.toLocaleString('tr-TR')],
        ['Toplam Paylasim', contentStats.totalShares.toLocaleString('tr-TR')],
        ['Toplam Kaydetme', contentStats.totalSaves.toLocaleString('tr-TR')],
      ]

      autoTable(doc, {
        startY: yPos,
          head: [['Kategori', 'Deger']],
        body: contentData,
        theme: 'striped',
        headStyles: { fillColor: [168, 85, 247], textColor: 255, fontStyle: 'bold', fontSize: 11 },
        bodyStyles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
        styles: { cellPadding: 5 },
      })

      yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30

      // Sayfa numaraları ekle
      const totalPages = doc.internal.pages.length || 1
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(128, 128, 128)
        doc.text(
          `Sayfa ${i} / ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
      }

      // PDF'i indir
      const fileName = `rapor_${selectedMonth}_${format(new Date(), 'yyyyMMdd')}.pdf`
      doc.save(fileName)
    } catch (error: any) {
      console.error('PDF oluşturma hatası:', error)
      alert(`PDF oluşturulurken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={generatePDF}
      disabled={exporting}
      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {exporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          <span>PDF Oluşturuluyor...</span>
        </>
      ) : (
        <>
          <FileText className="w-4 h-4 mr-2" />
          <span>PDF İndir</span>
        </>
      )}
    </button>
  )
}
