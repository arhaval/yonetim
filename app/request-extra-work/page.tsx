'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RequestExtraWorkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    workType: 'VOICE',
    amount: '',
    description: '',
  })

  const workTypes = [
    { value: 'VOICE', label: '🎙️ Seslendirme', desc: 'Ses kaydı yaptım' },
    { value: 'EDIT', label: '🎬 Video Kurgusu', desc: 'Video kurgusu yaptım' },
    { value: 'STREAM', label: '📺 Yayın', desc: 'Yayın yaptım' },
    { value: 'CONTENT', label: '📝 İçerik Üretimi', desc: 'Metin/içerik oluşturdum' },
    { value: 'OTHER', label: '📌 Diğer', desc: 'Başka bir iş' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description.trim()) {
      toast.error('Açıklama gereklidir')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/extra-work-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workType: formData.workType,
          amount: formData.amount ? parseFloat(formData.amount) : 0,
          description: formData.description,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Talep gönderildi! Admin tutar belirleyip onayladığında ödeme listesine eklenecek.')
        router.back()
      } else {
        toast.error(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Ekstra İş Talebi</h1>
            <p className="text-gray-600 mt-1">Ana işiniz dışında yaptığınız işler için ödeme talep edin</p>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Not:</strong> Ödeme tutarı admin tarafından belirlenecektir. Sadece yaptığınız işi açıklayın.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* İş Tipi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Yaptığınız İş *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {workTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, workType: type.value })}
                    className={`p-4 rounded-lg border-2 text-left transition ${
                      formData.workType === type.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-500 mt-1">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>


            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İş Detayı *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Yaptığınız işi detaylı olarak açıklayın..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Örn: "3 adet YouTube Shorts için seslendirme - Toplam 5 dakika"
              </p>
            </div>

            {/* Bilgi Kutusu */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Not:</strong> Talebiniz admin tarafından incelenecek ve onaylandığında "Tüm Ödemeler" listesine eklenecektir.
              </p>
            </div>

            {/* Butonlar */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              >
                {loading ? 'Gönderiliyor...' : 'Talep Gönder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

