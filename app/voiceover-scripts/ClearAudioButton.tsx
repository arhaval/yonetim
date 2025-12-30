'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function ClearAudioButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClear = async () => {
    if (!confirm('Tüm ses dosyalarını temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/voiceover-scripts/clear-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Bilinmeyen hata' }))
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }

      const data = await res.json()

      if (data.count !== undefined) {
        alert(`${data.count} ses dosyası temizlendi.`)
        router.refresh()
      } else {
        alert(data.message || 'Ses dosyaları temizlendi.')
        router.refresh()
      }
    } catch (error: any) {
      console.error('Error clearing audio:', error)
      alert(`Hata: ${error.message || 'Bir hata oluştu'}`)
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

