'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { DollarSign, FileText, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewPaymentRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [contents, setContents] = useState<any[]>([])
  const [registries, setRegistries] = useState<any[]>([])
  const [formData, setFormData] = useState({
    type: 'STREAM',
    amount: '',
    description: '',
    contentId: '',
    contentRegistryId: '',
    attachmentUrl: '',
  })

  useEffect(() => {
    fetchContents()
  }, [])

  const fetchContents = async () => {
    try {
      // Content ve ContentRegistry'leri getir
      const [contentRes, registryRes] = await Promise.all([
        fetch('/api/content'),
        fetch('/api/content-registry'),
      ])

      if (contentRes.ok) {
        const data = await contentRes.json()
        setContents(Array.isArray(data) ? data : [])
      }

      if (registryRes.ok) {
        const data = await registryRes.json()
        setRegistries(data.registries || [])
      }
    } catch (error) {
      console.error('Error fetching contents:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.type || !formData.amount || !formData.description) {
      toast.error('Lütfen tüm zorunlu alanları doldurun')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Geçerli bir tutar girin')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/payment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount,
          contentId: formData.contentId || null,
          contentRegistryId: formData.contentRegistryId || null,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Ödeme talebi başarıyla oluşturuldu!')
        router.push('/my-payment-requests')
      } else {
        toast.error(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const typeOptions = [
    { value: 'CONTENT', label: '📝 İçerik Üretimi', desc: 'Metin yazımı, içerik oluşturma' },
    { value: 'VOICE', label: '🎙️ Seslendirme', desc: 'Ses kaydı, dublaj' },
    { value: 'EDIT', label: '🎬 Kurgu/Montaj', desc: 'Video düzenleme, kurgu' },
    { value: 'STREAM', label: '📺 Yayın', desc: 'Canlı yayın, video yayını' },
    { value: 'DESIGN', label: '🎨 Tasarım', desc: 'Grafik tasarım, thumbnail' },
    { value: 'MANAGEMENT', label: '👔 Yönetim', desc: 'Proje yönetimi, koordinasyon' },
    { value: 'OTHER', label: '📌 Diğer', desc: 'Diğer hizmetler' },
  ]

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Yeni Ödeme Talebi</h1>
          <p className="text-gray-600 mt-1">Yaptığınız iş için ödeme talebinde bulunun</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 space-y-6">
            {/* İş Tipi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                İş Tipi *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: option.value })}
                    className={`p-4 rounded-lg border-2 text-left transition ${
                      formData.type === option.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500 mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tutar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tutar (TL) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  TL
                </span>
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama *
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
                Örn: "5 adet YouTube Shorts seslendirmesi - Toplam 10 dakika"
              </p>
            </div>

            {/* İlgili İçerik (Opsiyonel) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İlgili Yayın (Opsiyonel)
                </label>
                <select
                  value={formData.contentId}
                  onChange={(e) => setFormData({ ...formData, contentId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Seçiniz...</option>
                  {contents.map((content) => (
                    <option key={content.id} value={content.id}>
                      {content.title} ({content.platform})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İlgili İçerik Kaydı (Opsiyonel)
                </label>
                <select
                  value={formData.contentRegistryId}
                  onChange={(e) => setFormData({ ...formData, contentRegistryId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Seçiniz...</option>
                  {registries.map((registry) => (
                    <option key={registry.id} value={registry.id}>
                      {registry.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bilgi Kutusu */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Ödeme Süreci:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Talebiniz oluşturulur (Beklemede)</li>
                    <li>Admin tarafından incelenir ve onaylanır</li>
                    <li>Ödeme yapılır ve finansal kayıtlara işlenir</li>
                    <li>Size bildirim gönderilir</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
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
              {loading ? 'Gönderiliyor...' : 'Talep Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

