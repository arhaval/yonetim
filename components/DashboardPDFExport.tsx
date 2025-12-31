'use client'

import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { format, parse } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

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
        bodyStyles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
        styles: { cellPadding: 5 },
      })

      yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30

      // ========== GELİRLER (DETAYLI) ==========
      const allIncomes = data.allIncomes || []
      if (allIncomes.length > 0) {
        checkPageBreak(50)
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('GELIRLER (DETAYLI)', 14, yPos)
        yPos += 8

        const incomeData = allIncomes.map((income: any) => [
          format(new Date(income.date), 'dd.MM.yyyy', { locale: tr }),
          income.category || '-',
          income.description ? (income.description.length > 30 ? income.description.substring(0, 30) + '...' : income.description) : '-',
          formatCurrency(income.amount),
          income.streamerName || income.teamMemberName || income.contentCreatorName || income.voiceActorName || '-',
        ])

        autoTable(doc, {
          startY: yPos,
          head: [['Tarih', 'Kategori', 'Aciklama', 'Tutar', 'Ilgili Kisi']],
          body: incomeData,
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
          styles: { cellPadding: 3, overflow: 'linebreak' },
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
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('GIDERLER (DETAYLI)', 14, yPos)
        yPos += 8

        const expenseData = allExpenses.map((expense: any) => [
          format(new Date(expense.date), 'dd.MM.yyyy', { locale: tr }),
          expense.category || '-',
          expense.description ? (expense.description.length > 30 ? expense.description.substring(0, 30) + '...' : expense.description) : '-',
          formatCurrency(expense.amount),
          expense.streamerName || expense.teamMemberName || expense.contentCreatorName || expense.voiceActorName || '-',
        ])

        autoTable(doc, {
          startY: yPos,
          head: [['Tarih', 'Kategori', 'Aciklama', 'Tutar', 'Ilgili Kisi']],
          body: expenseData,
          theme: 'striped',
          headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
          styles: { cellPadding: 3, overflow: 'linebreak' },
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
        bodyStyles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
        styles: { cellPadding: 5 },
      })

      yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 30

      // Sosyal medya büyümesi
      const socialMediaGrowth = data.socialMediaGrowth || []
      if (socialMediaGrowth.length > 0) {
        checkPageBreak(40)
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('SOSYAL MEDYA BUYUMESI', 14, yPos)
        yPos += 8

        const socialMediaData = socialMediaGrowth.map((s: any) => [
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

      // Sayfa numaraları
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

