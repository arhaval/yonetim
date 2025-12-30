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
}: ExportPDFButtonProps) {
  const [exporting, setExporting] = useState(false)

  const generatePDF = async () => {
    setExporting(true)
    try {
      // Dynamic import for client-side only
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
      
      // Helper function to add new page if needed
      const checkPageBreak = (requiredSpace: number = 30) => {
        if (yPos + requiredSpace > pageHeight - 20) {
          doc.addPage()
          yPos = 20
        }
      }

      // Başlık
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text('AYLIK RAPOR', pageWidth / 2, yPos, { align: 'center' })
      yPos += 10

      // Tarih bilgisi
      doc.setFontSize(14)
      doc.setFont('helvetica', 'normal')
      const monthLabel = format(parse(selectedMonth + '-01', 'yyyy-MM-dd', new Date()), 'MMMM yyyy', { locale: tr })
      doc.text(`Dönem: ${monthLabel}`, pageWidth / 2, yPos, { align: 'center' })
      yPos += 15

      // ========== FİNANSAL ÖZET ==========
      checkPageBreak(40)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text('FİNANSAL ÖZET', 14, yPos)
      yPos += 8

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const financialData = [
        ['Gelir', stats.income.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })],
        ['Gider', stats.expense.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })],
        ['Net Kar', (stats.income - stats.expense).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })],
        ['Yayın Maliyeti', stats.streamCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })],
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
      checkPageBreak(40)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('ÖDEMELER', 14, yPos)
      yPos += 8

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const paymentSummary = [
        ['Yayıncılara Ödenen Toplam', (stats.totalStreamerPayments || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })],
        ['Seslendirmene Ödenen Toplam', (stats.totalVoiceActorPayments || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })],
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

      // Yayıncılara Ödenen Detaylar
      if (streamerPayments.length > 0) {
        checkPageBreak(50)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Yayıncılara Ödenen Ücretler', 14, yPos)
        yPos += 8

        const streamerPaymentData = streamerPayments.map((p) => [
          p.streamerName,
          p.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }),
          p.type,
          p.period,
          p.paidAt ? format(new Date(p.paidAt), 'dd.MM.yyyy', { locale: tr }) : '-',
        ])

        autoTable(doc, {
          startY: yPos,
          head: [['Yayıncı', 'Tutar', 'Tür', 'Dönem', 'Ödeme Tarihi']],
          body: streamerPaymentData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
          styles: { cellPadding: 3, overflow: 'linebreak', cellWidth: 'wrap' },
          columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 35 }, 2: { cellWidth: 25 }, 3: { cellWidth: 25 }, 4: { cellWidth: 30 } },
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30
      }

      // Seslendirmene Ödenen Detaylar
      if (voiceActorPayments.length > 0) {
        checkPageBreak(50)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Seslendirmene Ödenen Ücretler', 14, yPos)
        yPos += 8

        const voiceActorPaymentData = voiceActorPayments.map((v) => [
          v.voiceActorName,
          (v.price || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }),
          v.title.length > 40 ? v.title.substring(0, 40) + '...' : v.title,
          format(new Date(v.paidAt), 'dd.MM.yyyy', { locale: tr }),
        ])

        autoTable(doc, {
          startY: yPos,
          head: [['Seslendirmen', 'Tutar', 'Proje', 'Ödeme Tarihi']],
          body: voiceActorPaymentData,
          theme: 'striped',
          headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
          styles: { cellPadding: 3, overflow: 'linebreak', cellWidth: 'wrap' },
          columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 30 }, 2: { cellWidth: 70 }, 3: { cellWidth: 30 } },
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30
      }

      // ========== YAYINLAR ==========
      checkPageBreak(40)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('YAYINLAR', 14, yPos)
      yPos += 8

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const streamData = [
        ['Toplam Yayın', stats.streamCount.toString()],
        ['Dış Yayın', stats.externalStreamCount.toString()],
        ['Toplam Yayın Maliyeti', stats.streamCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })],
      ]

      autoTable(doc, {
        startY: yPos,
        head: [['Kategori', 'Değer']],
        body: streamData,
        theme: 'striped',
        headStyles: { fillColor: [236, 72, 153], textColor: 255, fontStyle: 'bold', fontSize: 11 },
        bodyStyles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
        styles: { cellPadding: 5 },
      })

      yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30

      // Yayın Detayları
      if (allStreams.length > 0) {
        checkPageBreak(60)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Yayın Detayları', 14, yPos)
        yPos += 8

        const streamDetailsData = allStreams.slice(0, 50).map((s) => [
          format(new Date(s.date), 'dd.MM.yyyy', { locale: tr }),
          s.streamerName,
          s.matchInfo ? (s.matchInfo.length > 30 ? s.matchInfo.substring(0, 30) + '...' : s.matchInfo) : '-',
          s.cost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }),
          s.streamerEarning.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }),
        ])

        autoTable(doc, {
          startY: yPos,
          head: [['Tarih', 'Yayıncı', 'Maç Bilgisi', 'Maliyet', 'Kazanç']],
          body: streamDetailsData,
          theme: 'striped',
          headStyles: { fillColor: [236, 72, 153], textColor: 255, fontStyle: 'bold', fontSize: 8 },
          bodyStyles: { fontSize: 7 },
          margin: { left: 14, right: 14 },
          styles: { cellPadding: 2, overflow: 'linebreak', cellWidth: 'wrap' },
          columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 35 }, 2: { cellWidth: 50 }, 3: { cellWidth: 30 }, 4: { cellWidth: 30 } },
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30
      }

      // ========== İÇERİKLER ==========
      checkPageBreak(40)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('İÇERİKLER', 14, yPos)
      yPos += 8

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const contentData = [
        ['İçerik Sayısı', stats.contentCount.toString()],
        ['Toplam Görüntülenme', contentStats.totalViews.toLocaleString('tr-TR')],
        ['Toplam Beğeni', contentStats.totalLikes.toLocaleString('tr-TR')],
        ['Toplam Yorum', contentStats.totalComments.toLocaleString('tr-TR')],
        ['Toplam Paylaşım', contentStats.totalShares.toLocaleString('tr-TR')],
        ['Toplam Kaydetme', contentStats.totalSaves.toLocaleString('tr-TR')],
      ]

      autoTable(doc, {
        startY: yPos,
        head: [['Kategori', 'Değer']],
        body: contentData,
        theme: 'striped',
        headStyles: { fillColor: [168, 85, 247], textColor: 255, fontStyle: 'bold', fontSize: 11 },
        bodyStyles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
        styles: { cellPadding: 5 },
      })

      yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30

      // İçerik Detayları
      if (allContentsDetailed.length > 0) {
        checkPageBreak(60)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('İçerik Detayları', 14, yPos)
        yPos += 8

        const contentDetailsData = allContentsDetailed.slice(0, 50).map((c) => [
          c.title.length > 35 ? c.title.substring(0, 35) + '...' : c.title,
          c.platform || '-',
          c.type || '-',
          c.views.toLocaleString('tr-TR'),
          c.likes.toLocaleString('tr-TR'),
          c.comments.toLocaleString('tr-TR'),
          format(new Date(c.publishDate), 'dd.MM.yyyy', { locale: tr }),
        ])

        autoTable(doc, {
          startY: yPos,
          head: [['Başlık', 'Platform', 'Tür', 'Görüntülenme', 'Beğeni', 'Yorum', 'Yayın Tarihi']],
          body: contentDetailsData,
          theme: 'striped',
          headStyles: { fillColor: [168, 85, 247], textColor: 255, fontStyle: 'bold', fontSize: 7 },
          bodyStyles: { fontSize: 6 },
          margin: { left: 14, right: 14 },
          styles: { cellPadding: 2, overflow: 'linebreak', cellWidth: 'wrap' },
          columnStyles: { 
            0: { cellWidth: 50 }, 
            1: { cellWidth: 25 }, 
            2: { cellWidth: 20 }, 
            3: { cellWidth: 25 }, 
            4: { cellWidth: 20 }, 
            5: { cellWidth: 20 },
            6: { cellWidth: 25 },
          },
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30
      }

      // Sayfa numaraları ekle
      const totalPages = doc.internal.getNumberOfPages()
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
