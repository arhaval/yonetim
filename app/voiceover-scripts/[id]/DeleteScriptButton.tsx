'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DeleteScriptButton({ scriptId }: { scriptId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Bu metni silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/voiceover-scripts/${scriptId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Bilinmeyen hata' }))
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }

      alert('Metin başarıyla silindi')
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting script:', error)
      alert(`Hata: ${error.message || 'Metin silinemedi'}`)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3 text-sm font-medium text-white shadow-lg hover:shadow-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Trash2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Siliniyor...' : 'Metni Sil'}
    </button>
  )
}

