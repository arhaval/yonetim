'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DeleteFinancialRecordButton({ recordId }: { recordId: string }) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Bu finansal kaydı silmek istediğinizden emin misiniz?')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/financial-records/${recordId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Finansal kayıt silinemedi')
        return
      }

      // Başarılı silme sonrası sayfayı yenile
      router.refresh()
    } catch (error) {
      console.error('Error deleting financial record:', error)
      alert('Finansal kayıt silinirken bir hata oluştu')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Finansal kaydı sil"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}

