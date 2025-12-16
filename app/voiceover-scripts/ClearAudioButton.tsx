'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

export default function ClearAudioButton() {
  const [loading, setLoading] = useState(false)

  const handleClear = async () => {
    if (!confirm('Tüm ses dosyalarını temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/voiceover-scripts/clear-audio', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        alert(`${data.count} ses dosyası temizlendi. Sayfa yenilenecek.`)
        window.location.reload()
      } else {
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClear}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3 text-sm font-medium text-white shadow-lg hover:shadow-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Trash2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Temizleniyor...' : 'Ses Dosyalarını Temizle'}
    </button>
  )
}

