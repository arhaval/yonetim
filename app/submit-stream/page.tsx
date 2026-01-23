'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { ArrowLeft, Twitch, Calendar, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SubmitStreamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userRole, setUserRole] = useState<'streamer' | null>(null)
  const [formData, setFormData] = useState({
    date: '',
    duration: '',
    matchInfo: '',
    teamName: '',
  })

  useEffect(() => {
    checkUserType()
  }, [])

  const checkUserType = async () => {
    // Cookie'den kullanıcı tipini belirle
    const cookies = document.cookie.split(';')
    const hasStreamer = cookies.some(c => c.trim().startsWith('streamer-id='))
    
    if (hasStreamer) {
      setUserRole('streamer')
    } else {
      toast.error('Bu sayfaya erişim yetkiniz yok')
      router.push('/giris')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.date || !formData.duration) {
      toast.error('Tarih ve süre gereklidir')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/stream-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date(formData.date).toISOString(),
          duration: parseInt(formData.duration),
          matchInfo: formData.matchInfo,
          teamName: formData.teamName,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Yayın gönderildi! Admin onayladığında ödeme listesine eklenecek.')
        router.push('/streamer-dashboard')
      } else {
        toast.error(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!userRole) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <AppShell role={userRole}>
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
              <Twitch className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Yayın Gönder</h1>
                <p className="text-gray-600 mt-1">Yaptığınız yayını gönderin, admin onaylayıp ödeme yapacak</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Tarih */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Yayın Tarihi *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Süre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Yayın Süresi (dakika) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="örn: 120"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Maç Bilgisi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maç Bilgisi (Opsiyonel)
              </label>
              <input
                type="text"
                value={formData.matchInfo}
                onChange={(e) => setFormData({ ...formData, matchInfo: e.target.value })}
                placeholder="örn: Eternal Fire vs Sangal"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Takım Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Takım Adı (Opsiyonel)
              </label>
              <input
                type="text"
                value={formData.teamName}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                placeholder="örn: Eternal Fire"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Bilgi Kutusu */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Not:</strong> Yayınınız gönderildikten sonra admin inceleyecek, kazancınızı hesaplayacak ve onaylayacak. Onaylandıktan sonra "Ödeme Bekleyenler" listesine eklenecektir.
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
                {loading ? 'Gönderiliyor...' : 'Yayını Gönder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  )
}

