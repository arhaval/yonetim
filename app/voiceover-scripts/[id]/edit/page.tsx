'use client'

import RoleAwareLayout from '@/components/RoleAwareLayout'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FileText, Loader2 } from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'

export default function EditVoiceoverScriptPage() {
  const router = useRouter()
  const params = useParams()
  const scriptId = params.id as string
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    text: '',
  })

  useEffect(() => {
    fetch(`/api/voiceover-scripts/${scriptId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setFormData({
            title: data.title || '',
            text: data.text || '',
          })
        }
        setLoadingData(false)
      })
      .catch((error) => {
        console.error('Error fetching script:', error)
        alert('Metin yüklenemedi')
        setLoadingData(false)
      })
  }, [scriptId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/voiceover-scripts/${scriptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        router.refresh()
      } else {
        alert(data.error || 'Bir hata oluştu')
        setLoading(false)
      }
    } catch (error) {
      alert('Bir hata oluştu')
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <RoleAwareLayout>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        </div>
      </RoleAwareLayout>
    )
  }

  return (
    <RoleAwareLayout backUrl={`/voiceover-scripts/${scriptId}`} backLabel="Metne dön">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Seslendirme Metnini Düzenle
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Metni düzenleyin ve formatlayın
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlık *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Metin başlığı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metin *
            </label>
            <RichTextEditor
              value={formData.text}
              onChange={(value) => setFormData({ ...formData, text: value })}
              placeholder="Seslendirme metnini buraya yazın... Kalın, italik, renkli yazı, font boyutu, stil gibi formatlamalar yapabilirsiniz."
            />
            <p className="mt-2 text-xs text-gray-500">
              Metni formatlayabilirsiniz: kalın, italik, renk, font boyutu, stil vb.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </RoleAwareLayout>
  )
}

