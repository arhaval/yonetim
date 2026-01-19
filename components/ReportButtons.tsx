'use client'

import { useState } from 'react'
import { FileText, Bot, Download } from 'lucide-react'
import { format } from 'date-fns'

export default function ReportButtons() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))

  const openFinancialReport = () => {
    window.open(`/api/reports/financial-pdf?month=${selectedMonth}`, '_blank')
  }

  const openAISummary = () => {
    window.open(`/api/reports/ai-summary?month=${selectedMonth}`, '_blank')
  }

  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Download className="w-4 h-4" />
        Raporlar
      </h3>
      
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            const value = format(date, 'yyyy-MM')
            const label = format(date, 'MMMM yyyy')
            return <option key={value} value={value}>{label}</option>
          })}
        </select>
        
        <button
          onClick={openFinancialReport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
          <FileText className="w-4 h-4" />
          Finansal Rapor
        </button>
        
        <button
          onClick={openAISummary}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
        >
          <Bot className="w-4 h-4" />
          AI Özet
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Raporlar yeni sekmede açılır. Tarayıcıdan PDF olarak kaydedebilirsiniz (Ctrl+P).
      </p>
    </div>
  )
}

