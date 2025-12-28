'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

export default function CreatorApproveButton({ scriptId, hasVoiceLink }: { scriptId: string, hasVoiceLink: boolean }) {
  const [submitting, setSubmitting] = useState(false)

  const handleApprove = async () => {
    if (!hasVoiceLink) {
      alert('Ses linki henüz eklenmemiş. Seslendirmen önce ses linkini eklemelidir.')
      return
    }

    if (!confirm('Sesi onaylıyor musunuz? Onayladıktan sonra admin fiyat girip final onayı yapacak.')) {
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`/api/voiceover-scripts/${scriptId}/creator-approve`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        alert('Ses başarıyla onaylandı! Admin fiyat girip final onayı yapacak.')
        window.location.reload()
      } else {
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  if (!hasVoiceLink) {
    return null // Ses linki yoksa buton gösterilmez
  }

  return (
    <button
      onClick={handleApprove}
      disabled={submitting}
      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    >
      <CheckCircle className="w-5 h-5 inline mr-2" />
      {submitting ? 'Onaylanıyor...' : 'Ses Doğru - Onayla'}
    </button>
  )
}

