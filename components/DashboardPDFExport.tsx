'use client'

import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { format, parse } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { removeTurkishChars } from '@/lib/pdf-utils'

export default function DashboardPDFExport() {
  const [exporting, setExporting] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))

  useEffect(() => {
    // Select element'ten ay değerini dinle
    const updateMonth = () => {
      const selectElement = document.getElementById('month-select') as HTMLSelectElement
      if (selectElement) {
        setSelectedMonth(selectElement.value)
      }
    }
    
    // İlk yüklemede ayı al
    updateMonth()
    
    // Select element'i bul ve event listener ekle
    const selectElement = document.getElementById('month-select') as HTMLSelectElement
    if (selectElement) {
      const handleChange = () => {
        setSelectedMonth(selectElement.value)
      }
      selectElement.addEventListener('change', handleChange)
      return () => selectElement.removeEventListener('change', handleChange)
    }
  }, [])

  const generatePDF = async () => {
    setExporting(true)
    try {
      // API'den verileri çek
      const params = new URLSearchParams({
        filter: 'monthly',
        month: selectedMonth,
      })

      const response = await fetch(`/api/reports?${params}`)
      if (!response.ok) {
        throw new Error('Veriler alınamadı')
      }

      const data = await response.json()

      // PDF modüllerini yükle
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

      // Fiyat formatı - ₺ sembolü
      const formatCurrency = (amount: number) => {
        return `₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }

      // Başlık
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text('AYLIK RAPOR', pageWidth / 2, yPos, { align: 'center' })
      yPos += 12

      // Tarih bilgisi
      doc.setFontSize(14)
      doc.setFont('helvetica', 'normal')
      const monthLabel = format(parse(selectedMonth + '-01', 'yyyy-MM-dd', new Date()), 'MMMM yyyy', { locale: tr })
      doc.text(`Donem: ${removeTurkishChars(monthLabel)}`, pageWidth / 2, yPos, { align: 'center' })
      yPos += 15

      // ========== FİNANSAL ÖZET ==========
      checkPageBreak(40)
      doc.setFillColor(240, 240, 240)
      doc.rect(margin, yPos - 3, pageWidth - (margin * 2), 8, 'F')
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text('FINANSAL OZET', margin + 2, yPos + 5)
      yPos += 12

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      const stats = data.stats || {}
      const financialData = [
        ['Gelir', formatCurrency(stats.income || 0)],
        ['Gider', formatCurrency(stats.expense || 0)],
        ['Net Kar', formatCurrency((stats.income || 0) - (stats.expense || 0))],
        ['Yayin Maliyeti', formatCurrency(stats.streamCost || 0)],
      ]

      autoTable(doc, {
        startY: yPos,
        head: [['Kategori', 'Tutar']],
        body: financialData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold', fontSize: 11 },
        bodyStyles: { fontSize: 10, textColor: [30, 30, 30] },
        margin: { left: margin, right: margin },
        styles: { cellPadding: 5, lineWidth: 0.1 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
      })

      yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30

      // ========== GELİRLER (DETAYLI) ==========
      const allIncomes = data.allIncomes || []
      if (allIncomes.length > 0) {
        checkPageBreak(50)
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, yPos - 3, pageWidth - (margin * 2), 8, 'F')
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 30, 30)
        doc.text('GELIRLER (DETAYLI)', margin + 2, yPos + 5)
        yPos += 12

        const incomeData = allIncomes.map((income: any) => {
          const dateStr = format(new Date(income.date), 'dd.MM.yyyy', { locale: tr })
          return [
            removeTurkishChars(dateStr),
            removeTurkishChars(income.category || '-'),
            income.description ? removeTurkishChars(income.description.length > 30 ? income.description.substring(0, 30) + '...' : income.description) : '-',
            formatCurrency(income.amount),
            removeTurkishChars(income.streamerName || income.teamMemberName || income.contentCreatorName || income.voiceActorName || '-'),
          ]
        })

        autoTable(doc, {
          startY: yPos,
          head: [['Tarih', 'Kategori', 'Aciklama', 'Tutar', 'Ilgili Kisi']],
          body: incomeData,
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
          margin: { left: margin, right: margin },
          styles: { cellPadding: 3, overflow: 'linebreak', lineWidth: 0.1 },
          alternateRowStyles: { fillColor: [250, 250, 250] },
          columnStyles: { 
            0: { cellWidth: 25 }, 
            1: { cellWidth: 30 }, 
            2: { cellWidth: 50 }, 
            3: { cellWidth: 30 },
            4: { cellWidth: 35 },
          },
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30
      }

      // ========== GİDERLER (DETAYLI) ==========
      const allExpenses = data.allExpenses || []
      if (allExpenses.length > 0) {
        checkPageBreak(50)
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, yPos - 3, pageWidth - (margin * 2), 8, 'F')
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 30, 30)
        doc.text('GIDERLER (DETAYLI)', margin + 2, yPos + 5)
        yPos += 12

        const expenseData = allExpenses.map((expense: any) => {
          const dateStr = format(new Date(expense.date), 'dd.MM.yyyy', { locale: tr })
          return [
            removeTurkishChars(dateStr),
            removeTurkishChars(expense.category || '-'),
            expense.description ? removeTurkishChars(expense.description.length > 30 ? expense.description.substring(0, 30) + '...' : expense.description) : '-',
            formatCurrency(expense.amount),
            removeTurkishChars(expense.streamerName || expense.teamMemberName || expense.contentCreatorName || expense.voiceActorName || '-'),
          ]
        })

        autoTable(doc, {
          startY: yPos,
          head: [['Tarih', 'Kategori', 'Aciklama', 'Tutar', 'Ilgili Kisi']],
          body: expenseData,
          theme: 'striped',
          headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
          margin: { left: margin, right: margin },
          styles: { cellPadding: 3, overflow: 'linebreak', lineWidth: 0.1 },
          alternateRowStyles: { fillColor: [250, 250, 250] },
          columnStyles: { 
            0: { cellWidth: 25 }, 
            1: { cellWidth: 30 }, 
            2: { cellWidth: 50 }, 
            3: { cellWidth: 30 },
            4: { cellWidth: 35 },
          },
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30
      }

      // Ödemeler özeti
      checkPageBreak(35)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('ODEMELER', 14, yPos)
      yPos += 8

      const streamerPayments = data.streamerPayments || []
      const voiceActorPayments = data.voiceActorPayments || []
      const totalStreamerPayments = streamerPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
      const totalVoiceActorPayments = voiceActorPayments.reduce((sum: number, v: any) => sum + (v.price || 0), 0)

      const paymentSummary = [
        ['Yayincilara Odenen Toplam', formatCurrency(totalStreamerPayments)],
        ['Seslendirmene Odenen Toplam', formatCurrency(totalVoiceActorPayments)],
        ['Toplam Odeme', formatCurrency(totalStreamerPayments + totalVoiceActorPayments)],
      ]

      autoTable(doc, {
        startY: yPos,
        head: [['Kategori', 'Tutar']],
        body: paymentSummary,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 11 },
        bodyStyles: { fontSize: 10, textColor: [30, 30, 30] },
        margin: { left: margin, right: margin },
        styles: { cellPadding: 5, lineWidth: 0.1 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
      })

      yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30

      // ========== YAYINLAR (DETAYLI) ==========
      const allStreams = data.allStreams || []
      if (allStreams.length > 0) {
        checkPageBreak(50)
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('YAYINLAR (DETAYLI)', 14, yPos)
        yPos += 8

        const streamData = allStreams.map((stream: any) => {
          const dateStr = format(new Date(stream.date), 'dd.MM.yyyy', { locale: tr })
          return [
            removeTurkishChars(dateStr),
            removeTurkishChars(stream.streamerName || '-'),
            stream.matchInfo ? removeTurkishChars(stream.matchInfo.length > 25 ? stream.matchInfo.substring(0, 25) + '...' : stream.matchInfo) : '-',
            formatCurrency(stream.cost),
            formatCurrency(stream.streamerEarning || 0),
          ]
        })

        autoTable(doc, {
          startY: yPos,
          head: [['Tarih', 'Yayinci', 'Mac Bilgisi', 'Maliyet', 'Kazanç']],
          body: streamData,
          theme: 'striped',
          headStyles: { fillColor: [236, 72, 153], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
          margin: { left: margin, right: margin },
          styles: { cellPadding: 3, overflow: 'linebreak', lineWidth: 0.1 },
          alternateRowStyles: { fillColor: [250, 250, 250] },
          columnStyles: { 
            0: { cellWidth: 25 }, 
            1: { cellWidth: 40 }, 
            2: { cellWidth: 50 }, 
            3: { cellWidth: 30 },
            4: { cellWidth: 30 },
          },
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30
      }

      // ========== İÇERİKLER (DETAYLI) ==========
      const allContentsDetailed = data.allContentsDetailed || []
      if (allContentsDetailed.length > 0) {
        checkPageBreak(50)
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, yPos - 3, pageWidth - (margin * 2), 8, 'F')
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 30, 30)
        doc.text('ICERIKLER (DETAYLI)', margin + 2, yPos + 5)
        yPos += 12

        const contentData = allContentsDetailed.map((content: any) => {
          const dateStr = format(new Date(content.publishDate), 'dd.MM.yyyy', { locale: tr })
          return [
            content.title ? removeTurkishChars(content.title.length > 20 ? content.title.substring(0, 20) + '...' : content.title) : '-',
            removeTurkishChars(content.platform || '-'),
            removeTurkishChars(content.type || '-'),
            content.views?.toLocaleString('tr-TR') || '0',
            content.likes?.toLocaleString('tr-TR') || '0',
            content.comments?.toLocaleString('tr-TR') || '0',
            removeTurkishChars(dateStr),
          ]
        })

        autoTable(doc, {
          startY: yPos,
          head: [['Baslik', 'Platform', 'Tip', 'Goruntulenme', 'Begeni', 'Yorum', 'Tarih']],
          body: contentData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 8 },
          bodyStyles: { fontSize: 7, textColor: [30, 30, 30] },
          margin: { left: margin, right: margin },
          styles: { cellPadding: 2, overflow: 'linebreak', fontSize: 7, lineWidth: 0.1 },
          alternateRowStyles: { fillColor: [250, 250, 250] },
          columnStyles: { 
            0: { cellWidth: 35 }, 
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

      // ========== YAYINCI ÖDEMELERİ (DETAYLI - TÜMÜ) ==========
      if (streamerPayments.length > 0) {
        checkPageBreak(50)
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, yPos - 3, pageWidth - (margin * 2), 8, 'F')
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 30, 30)
        doc.text('YAYINCI ODEMELERI (DETAYLI - TUMU)', margin + 2, yPos + 5)
        yPos += 12

        const streamerPaymentData = streamerPayments.map((p: any) => {
          const dateStr = p.paidAt ? format(new Date(p.paidAt), 'dd.MM.yyyy', { locale: tr }) : '-'
          return [
            removeTurkishChars(p.streamerName || '-'),
            formatCurrency(p.amount),
            removeTurkishChars(p.type || '-'),
            removeTurkishChars(p.period || '-'),
            removeTurkishChars(dateStr),
            p.description ? removeTurkishChars(p.description.length > 20 ? p.description.substring(0, 20) + '...' : p.description) : '-',
          ]
        })

        autoTable(doc, {
          startY: yPos,
          head: [['Yayinci', 'Tutar', 'Tip', 'Donem', 'Odeme Tarihi', 'Aciklama']],
          body: streamerPaymentData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 8 },
          bodyStyles: { fontSize: 7, textColor: [30, 30, 30] },
          margin: { left: margin, right: margin },
          styles: { cellPadding: 2, overflow: 'linebreak', lineWidth: 0.1 },
          alternateRowStyles: { fillColor: [250, 250, 250] },
          columnStyles: { 
            0: { cellWidth: 35 }, 
            1: { cellWidth: 30 }, 
            2: { cellWidth: 25 }, 
            3: { cellWidth: 25 },
            4: { cellWidth: 30 },
            5: { cellWidth: 35 },
          },
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30
      }

      // ========== SESLENDİRMEN ÖDEMELERİ (DETAYLI - TÜMÜ) ==========
      if (voiceActorPayments.length > 0) {
        checkPageBreak(50)
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, yPos - 3, pageWidth - (margin * 2), 8, 'F')
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 30, 30)
        doc.text('SESLENDIRMEN ODEMELERI (DETAYLI - TUMU)', margin + 2, yPos + 5)
        yPos += 12

        const voiceActorPaymentData = voiceActorPayments.map((v: any) => {
          const dateStr = v.paidAt ? format(new Date(v.paidAt), 'dd.MM.yyyy', { locale: tr }) : '-'
          return [
            removeTurkishChars(v.voiceActorName || '-'),
            formatCurrency(v.price || 0),
            v.title ? removeTurkishChars(v.title.length > 25 ? v.title.substring(0, 25) + '...' : v.title) : '-',
            removeTurkishChars(dateStr),
          ]
        })

        autoTable(doc, {
          startY: yPos,
          head: [['Seslendirmen', 'Tutar', 'Proje', 'Odeme Tarihi']],
          body: voiceActorPaymentData,
          theme: 'striped',
          headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold', fontSize: 8 },
          bodyStyles: { fontSize: 7, textColor: [30, 30, 30] },
          margin: { left: margin, right: margin },
          styles: { cellPadding: 2, overflow: 'linebreak', lineWidth: 0.1 },
          alternateRowStyles: { fillColor: [250, 250, 250] },
          columnStyles: { 
            0: { cellWidth: 40 }, 
            1: { cellWidth: 30 }, 
            2: { cellWidth: 60 }, 
            3: { cellWidth: 30 },
          },
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30
      }

      // Sosyal medya büyümesi
      const socialMediaGrowth = data.socialMediaGrowth || []
      if (socialMediaGrowth.length > 0) {
        checkPageBreak(40)
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, yPos - 3, pageWidth - (margin * 2), 8, 'F')
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 30, 30)
        doc.text('SOSYAL MEDYA BUYUMESI', margin + 2, yPos + 5)
        yPos += 12

        const socialMediaData = socialMediaGrowth.map((s: any) => {
          // Büyüme yüzdesi hesapla
          let growthPercent = '-'
          if (s.previousCount > 0 && s.currentCount > 0) {
            const growth = ((s.currentCount - s.previousCount) / s.previousCount) * 100
            growthPercent = `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`
          } else if (s.previousCount === 0 && s.currentCount > 0) {
            growthPercent = '+100.0%' // İlk kez eklenmişse %100 artış
          }
          
          return [
            removeTurkishChars(s.platform),
            s.currentCount.toLocaleString('tr-TR'),
            s.previousCount > 0 ? s.previousCount.toLocaleString('tr-TR') : '-',
            s.growthCount > 0 ? `+${s.growthCount.toLocaleString('tr-TR')}` : s.growthCount.toLocaleString('tr-TR'),
            growthPercent,
            s.target ? s.target.toLocaleString('tr-TR') : '-',
          ]
        })

        autoTable(doc, {
          startY: yPos,
          head: [['Platform', 'Mevcut', 'Onceki', 'Artis', 'Buyume %', 'Hedef']],
          body: socialMediaData,
          theme: 'striped',
          headStyles: { fillColor: [168, 85, 247], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
          margin: { left: margin, right: margin },
          styles: { cellPadding: 3, overflow: 'linebreak', lineWidth: 0.1 },
          alternateRowStyles: { fillColor: [250, 250, 250] },
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

      // Sayfa numaraları - Alt çizgi ile
      const totalPages = doc.internal.pages.length || 1
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        // Alt çizgi
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.5)
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)
        
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
      const selectElement = document.getElementById('month-select') as HTMLSelectElement
      const currentMonth = selectElement?.value || selectedMonth
      const fileName = `rapor_${currentMonth}_${format(new Date(), 'yyyyMMdd')}.pdf`
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

