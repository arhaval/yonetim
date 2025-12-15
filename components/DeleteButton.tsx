'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface DeleteButtonProps {
  id: string
  type: 'team' | 'streamer' | 'content-creator' | 'stream' | 'content'
  onDelete?: () => void
  compact?: boolean
  className?: string
}

export default function DeleteButton({ 
  id, 
  type,
  onDelete,
  compact = false,
  className = ''
}: DeleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const getApiPath = () => {
    switch (type) {
      case 'team':
        return `/api/team/${id}`
      case 'streamer':
        return `/api/streamers/${id}`
      case 'content-creator':
        return `/api/content-creators/${id}`
      case 'stream':
        return `/api/streams/${id}`
      case 'content':
        return `/api/content/${id}`
      default:
        return ''
    }
  }

  const getConfirmMessage = () => {
    switch (type) {
      case 'team':
        return 'Bu ekip üyesini ve ilgili tüm görevleri, ödemeleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
      case 'streamer':
        return 'Bu yayıncıyı ve ilgili tüm yayınları, ödemeleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
      case 'content-creator':
        return 'Bu içerik üreticisini ve ilgili tüm içerikleri, metinleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
      case 'stream':
        return 'Bu yayını ve ilgili tüm finansal kayıtları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
      case 'content':
        return 'Bu içeriği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
      default:
        return 'Bu öğeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
    }
  }

  const getRedirectPath = () => {
    switch (type) {
      case 'team':
        return '/team'
      case 'streamer':
        return '/streamers'
      case 'content-creator':
        return '/content-creators'
      case 'stream':
        return '/streams'
      case 'content':
        return '/content'
      default:
        return '/'
    }
  }

  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!confirm(getConfirmMessage())) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(getApiPath(), {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok) {
        alert(data.message || 'Başarıyla silindi')
        if (onDelete) {
          onDelete()
        } else {
          router.push(getRedirectPath())
          router.refresh()
        }
      } else {
        alert(data.error || 'Silme işlemi başarısız oldu')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Silme işlemi sırasında bir hata oluştu')
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleDelete}
        disabled={loading}
        className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 ${className}`}
        title="Sil"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    )
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 ${className}`}
    >
      <Trash2 className="w-4 h-4 mr-2" />
      {loading ? 'Siliniyor...' : 'Sil'}
    </button>
  )
}

