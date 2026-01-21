'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { ArrowLeft, Mic, Video } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SubmitWorkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState<'voiceActor' | 'editor' | null>(null)
  const [formData, setFormData] = useState({
    workType: '',
    workName: '',
    description: '',
  })

  useEffect(() => {
    checkUserType()
  }, [])

  const checkUserType = async () => {
    // Cookie'den kullanıcı tipini belirle
    const cookies = document.cookie.split(';')
    const hasVoiceActor = cookies.some(c => c.trim().startsWith('voice-actor-id='))
    const hasTeamMember = cookies.some(c => c.trim().startsWith('team-member-id='))
    
    if (hasVoiceActor) {
      setUserType('voiceActor')
      setFormData({ ...formData, workType: 'SHORT_VOICE' })
    } else if (hasTeamMember) {
      setUserType('editor')
      setFormData({ ...formData, workType: 'SHORT_VIDEO' })
    }
  }

  const workTypes = userType === 'voiceActor' ? [
    { value: 'SHORT_VOICE', label: '🎙️ Kısa Ses', desc: 'Kısa seslendirme işi (örn: Shorts, Reels)' },
    { value: 'LONG_VOICE', label: '🎙️ Uzun Ses', desc: 'Uzun seslendirme işi (örn: Uzun video)' },
  ] : [
    { value: 'SHORT_VIDEO', label: '🎬 Kısa Video', desc: 'Kısa video kurgusu (örn: Shorts, Reels)' },
    { value: 'LONG_VIDEO', label: '🎬 Uzun Video', desc: 'Uzun video kurgusu (örn: YouTube videosu)' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.workName.trim()) {
      toast.error('İş ismi gereklidir')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/work-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('İş gönderildi! Admin onayladığında ödeme listesine eklenecek.')
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

  if (!userType) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    )
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
            <div className="flex items-center gap-3">
              {userType === 'voiceActor' ? (
                <Mic className="w-8 h-8 text-indigo-600" />
              ) : (
                <Video className="w-8 h-8 text-indigo-600" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userType === 'voiceActor' ? 'Seslendirme İşi Gönder' : 'Video Kurgu İşi Gönder'}
                </h1>
                <p className="text-gray-600 mt-1">Yaptığınız işi gönderin, admin onaylayıp ödeme yapacak</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* İş Tipi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                İş Tipi *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {/* İş İsmi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İş İsmi *
              </label>
              <input
                type="text"
                required
                value={formData.workName}
                onChange={(e) => setFormData({ ...formData, workName: e.target.value })}
                placeholder={userType === 'voiceActor' ? 'örn: Eternal Fire Maç Özeti' : 'örn: Sangal vs Eternal Fire Highlights'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama (Opsiyonel)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="İş hakkında ek bilgi..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Bilgi Kutusu */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Not:</strong> İşiniz gönderildikten sonra admin inceleyecek, maliyeti girecek ve onaylayacak. Onaylandıktan sonra "Tüm Ödemeler" listesine eklenecektir.
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
                {loading ? 'Gönderiliyor...' : 'İşi Gönder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

