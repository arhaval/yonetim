'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

interface DeleteButtonProps {
  id: string
  type: 'streamer' | 'content-creator' | 'content' | 'voice-actor' | 'user'
  onDelete?: () => void
  compact?: boolean
}

export default function DeleteButton({ id, type, onDelete, compact = false }: DeleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const getApiEndpoint = (type: string) => {
    switch (type) {
      case 'streamer': return '/api/streamers'
      case 'content-creator': return '/api/content-creators'
      case 'content': return '/api/content' // Klasör yapına göre singular
      case 'voice-actor': return '/api/voice-actors'
      case 'user': return '/api/users'
      default: return `/api/${type}s`
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Bu öğeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    setLoading(true)

    try {
      const endpoint = getApiEndpoint(type)
      const res = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        if (onDelete) {
          // Eğer bir yenileme fonksiyonu gönderildiyse onu çalıştır
          onDelete()
        } else {
          // Gönderilmediyse (Server Component'ler için) sayfayı yenile
          router.refresh()
          router.push(window.location.pathname) // Force reload etkisi
        }
      } else {
        const errorData = await res.json()
        alert(`Hata: ${errorData.error || 'Silme işlemi başarısız oldu'}`)
      }
    } catch (error) {
      console.error('Silme hatası:', error)
      alert('Bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
        title="Sil"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4 mr-2" />
      )}
      Sil
    </button>
  )
}