'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteStreamButton({ 
  streamId, 
  streamerId,
  compact = false
}: { 
  streamId: string
  streamerId: string
  compact?: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Bu yayını ve ilgili tüm finansal kayıtları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/streams/${streamId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Yayın başarıyla silindi')
        router.push(`/streamers/${streamerId}`)
      } else {
        const data = await res.json()
        alert(data.error || 'Yayın silinirken bir hata oluştu')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error deleting stream:', error)
      alert('Yayın silinirken bir hata oluştu')
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleDelete()
        }}
        disabled={loading}
        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        title="Yayını Sil"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    )
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      {loading ? 'Siliniyor...' : 'Yayını Sil'}
    </button>
  )
}

