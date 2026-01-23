'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, DollarSign, CheckCircle2, Clock, Video, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import toast from 'react-hot-toast'

export default function StreamerDashboardPage() {
  const router = useRouter()
  const [streamer, setStreamer] = useState<any>(null)
  const [streams, setStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/streamer-auth/me', { credentials: 'include' })
      const data = await res.json()

      if (!data.streamer) {
        router.push('/streamer-login')
        return
      }

      setStreamer(data.streamer)
      loadStreams(data.streamer.id)
      loadPaymentInfo(data.streamer.id)
    } catch (error) {
      toast.error('Kullanıcı bilgileri yüklenemedi')
      router.push('/streamer-login')
    }
  }

  const loadStreams = async (streamerId: string) => {
    try {
      const res = await fetch(`/api/streamer/streams?streamerId=${streamerId}`, { credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setStreams(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error loading streams:', error)
      setStreams([])
    } finally {
      setLoading(false)
    }
  }

  const loadPaymentInfo = async (streamerId: string) => {
    try {
      const res = await fetch('/api/streamer/payments', { credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setPaymentInfo(data)
      }
    } catch (error) {
      console.error('Error loading payment info:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/streamer-auth/logout', { method: 'POST', credentials: 'include' })
      router.push('/streamer-login')
    } catch (error) {
      router.push('/streamer-login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!streamer) return null

  // Streams'den direkt hesapla
  const paidEarnings = streams
    .filter((s: any) => s.paymentStatus === 'paid')
    .reduce((sum: number, s: any) => sum + (s.streamerEarning || 0), 0)
  const pendingEarnings = streams
    .filter((s: any) => s.paymentStatus !== 'paid' && s.streamerEarning > 0)
    .reduce((sum: number, s: any) => sum + (s.streamerEarning || 0), 0)
  const totalEarnings = paidEarnings + pendingEarnings
  const completedStreams = streams.filter((s: any) => s.paymentStatus === 'paid').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hoş geldiniz, {streamer.name}</h1>
              <p className="text-gray-600">Yayın ve kazanç bilgilerinizi buradan takip edebilirsiniz</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/submit-stream')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
                Yayın Gönder
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* İstatistikler */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Kazanç</p>
                <p className="text-2xl font-bold text-gray-900">₺{totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ödenen</p>
                <p className="text-2xl font-bold text-gray-900">₺{paidEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bekleyen Ödeme</p>
                <p className="text-2xl font-bold text-gray-900">₺{pendingEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tamamlanan Yayın</p>
                <p className="text-2xl font-bold text-gray-900">{completedStreams}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Son Yayınlar */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Son Yayınlarım</h2>
          </div>
          <div className="p-6">
            {streams.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Henüz yayın kaydı bulunmuyor</p>
                <button
                  onClick={() => router.push('/submit-stream')}
                  className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  İlk Yayınını Gönder
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tarih</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Maç Bilgisi</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Süre</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Durum</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Kazanç</th>
                    </tr>
                  </thead>
                  <tbody>
                    {streams.slice(0, 10).map((stream: any) => (
                      <tr key={stream.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(stream.date), 'dd MMM yyyy', { locale: tr })}
                        </td>
                        <td className="py-3 px-4 text-sm">{stream.matchInfo || '-'}</td>
                        <td className="py-3 px-4 text-sm">{stream.duration || '-'} dk</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            stream.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {stream.paymentStatus === 'paid' ? 'Ödendi' : 'Bekliyor'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-medium">
                          {stream.streamerEarning ? `₺${stream.streamerEarning.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
