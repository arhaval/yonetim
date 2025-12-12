'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import StreamCostModal from './StreamCostModal'

interface ApproveStreamButtonProps {
  streamId: string
  onUpdate?: () => void
}

export default function ApproveStreamButton({ streamId, onUpdate }: ApproveStreamButtonProps) {
  const [loading, setLoading] = useState(false)
  const [stream, setStream] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleApprove = async () => {
    // Önce stream bilgilerini çek
    setLoading(true)
    try {
      const res = await fetch(`/api/streams/${streamId}`)
      const data = await res.json()
      if (res.ok) {
        setStream(data)
        setIsModalOpen(true)
      } else {
        alert('Yayın bilgileri alınamadı')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!confirm('Bu yayını reddetmek istediğinizden emin misiniz?')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/streams/${streamId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })

      if (res.ok) {
        alert('Yayın reddedildi')
        if (onUpdate) {
          onUpdate()
        } else {
          window.location.reload()
        }
      } else {
        const data = await res.json()
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleModalUpdate = async () => {
    // Modal'da maliyet girildikten sonra yayını onayla
    try {
      const res = await fetch(`/api/streams/${streamId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })

      if (res.ok) {
        alert('Yayın onaylandı ve maliyet bilgileri kaydedildi!')
        if (onUpdate) {
          onUpdate()
        } else {
          window.location.reload()
        }
      } else {
        const data = await res.json()
        alert(data.error || 'Onaylama sırasında bir hata oluştu')
      }
    } catch (error) {
      alert('Onaylama sırasında bir hata oluştu')
    }
  }

  return (
    <>
      <button
        onClick={handleApprove}
        disabled={loading}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        title="Onayla ve Fiyat Gir"
      >
        <Check className="w-4 h-4 mr-1" />
        Onayla
      </button>
      <button
        onClick={handleReject}
        disabled={loading}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        title="Reddet"
      >
        <X className="w-4 h-4" />
      </button>

      {stream && (
        <StreamCostModal
          stream={stream}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setStream(null)
          }}
          onUpdate={handleModalUpdate}
        />
      )}
    </>
  )
}

