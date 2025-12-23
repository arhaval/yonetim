'use client'

import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

// Dynamic import for jsPDF to avoid SSR issues
let jsPDF: any
let autoTable: any

if (typeof window !== 'undefined') {
  import('jspdf').then((module) => {
    jsPDF = module.default
  })
  import('jspdf-autotable').then((module) => {
    autoTable = module.default
  })
}

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
}: ExportPDFButtonProps) {
  const [exporting, setExporting] = useState(false)

  const generatePDF = async () => {
    setExporting(true)
    try {
      console.log('Starting PDF generation...')
      
      // Dynamic import for client-side only
      const jsPDFModule = await import('jspdf')
      const autoTableModule = await import('jspdf-autotable')
      
      if (!jsPDFModule || !jsPDFModule.default) {
        throw new Error('jsPDF modülü yüklenemedi')
      }
      
      if (!autoTableModule) {
        throw new Error('jspdf-autotable modülü yüklenemedi')
      }
      
      const jsPDF = jsPDFModule.default
      // autoTable default export olmayabilir, doğrudan modülü kullan
      const autoTable = (autoTableModule as any).default || autoTableModule
      
      if (typeof autoTable !== 'function') {
        throw new Error('autoTable fonksiyonu bulunamadı')
      }
      
      console.log('jsPDF loaded:', !!jsPDF)
      console.log('autoTable loaded:', typeof autoTable)
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })
      
      if (!doc || !doc.internal) {
        throw new Error('PDF dokümanı oluşturulamadı')
      }
      
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPos = 20
      
      console.log('PDF document created, page size:', pageWidth, 'x', pageHeight)

      // Başlık
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Aylık Rapor', pageWidth / 2, yPos, { align: 'center' })
      yPos += 10

      // Tarih bilgisi
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      const monthLabel = filter === 'monthly'
        ? format(new Date(selectedMonth + '-01'), 'MMMM yyyy', { locale: tr })
        : 'Tüm Zamanlar'
      doc.text(`Dönem: ${monthLabel}`, pageWidth / 2, yPos, { align: 'center' })
      yPos += 15

      // Finansal Özet
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Finansal Özet', 14, yPos)
      yPos += 8

      doc.setFontSize(11)
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
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : yPos + 30

      // Yayın İstatistikleri
      if (yPos > pageHeight - 40) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Yayın İstatistikleri', 14, yPos)
      yPos += 8

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      const streamData = [
        ['Toplam Yayın', stats.streamCount.toString()],
        ['Dış Yayın', stats.externalStreamCount.toString()],
      ]

      autoTable(doc, {
        startY: yPos,
        head: [['Kategori', 'Değer']],
        body: streamData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : yPos + 30

      // En Aktif Yayıncılar
      if (topStreamers.length > 0) {
        if (yPos > pageHeight - 60) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('En Aktif Yayıncılar', 14, yPos)
        yPos += 8

        const streamerData = topStreamers.slice(0, 10).map((s) => [
          s.name,
          s.streamCount.toString(),
        ])

        autoTable(doc, {
          startY: yPos,
          head: [['Yayıncı', 'Yayın Sayısı']],
          body: streamerData,
          theme: 'striped',
          headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 },
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : yPos + 30
      }

      // İçerik İstatistikleri
      if (yPos > pageHeight - 40) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('İçerik İstatistikleri', 14, yPos)
      yPos += 8

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      const contentData = [
        ['İçerik Sayısı', stats.contentCount.toString()],
        ['Görüntülenme', (contentStats.totalViews / 1000).toFixed(1) + 'K'],
        ['Beğeni', (contentStats.totalLikes / 1000).toFixed(1) + 'K'],
        ['Yorum', (contentStats.totalComments / 1000).toFixed(1) + 'K'],
        ['Paylaşım', (contentStats.totalShares / 1000).toFixed(1) + 'K'],
        ['Etkileşim', (contentStats.totalEngagement / 1000).toFixed(1) + 'K'],
      ]

      autoTable(doc, {
        startY: yPos,
        head: [['Kategori', 'Değer']],
        body: contentData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : yPos + 30

      // En Çok Görüntülenen İçerikler
      if (topContentByViews.length > 0) {
        if (yPos > pageHeight - 60) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('En Çok Görüntülenen İçerikler', 14, yPos)
        yPos += 8

        const topViewsData = topContentByViews.slice(0, 10).map((c) => [
          c.title.length > 40 ? c.title.substring(0, 40) + '...' : c.title,
          c.platform,
          c.views.toLocaleString('tr-TR'),
        ])

        autoTable(doc, {
          startY: yPos,
          head: [['İçerik', 'Platform', 'Görüntülenme']],
          body: topViewsData,
          theme: 'striped',
          headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 9 },
          margin: { left: 14, right: 14 },
          columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 40 }, 2: { cellWidth: 40 } },
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : yPos + 30
      }

      // Platform Dağılımı
      if (contentByPlatform.length > 0) {
        if (yPos > pageHeight - 60) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('Platform Dağılımı', 14, yPos)
        yPos += 8

        const platformData = contentByPlatform.map((p) => [
          p.platform,
          p.count.toString(),
        ])

        autoTable(doc, {
          startY: yPos,
          head: [['Platform', 'İçerik Sayısı']],
          body: platformData,
          theme: 'striped',
          headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 },
        })
      }

      // Sayfa numaraları ekle
      try {
        const totalPages = (doc as any).internal?.getNumberOfPages?.() || doc.internal.pages?.length || 1
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i)
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text(
            `Sayfa ${i} / ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          )
        }
      } catch (pageError) {
        console.warn('Sayfa numaraları eklenirken hata:', pageError)
        // Sayfa numarası eklenemezse devam et
      }

      // PDF'i indir
      const fileName = `rapor_${filter === 'monthly' ? selectedMonth : 'tum_zamanlar'}_${format(new Date(), 'yyyyMMdd')}.pdf`
      console.log('Saving PDF with filename:', fileName)
      doc.save(fileName)
      console.log('PDF saved successfully')
    } catch (error: any) {
      console.error('PDF oluşturma hatası:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
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

