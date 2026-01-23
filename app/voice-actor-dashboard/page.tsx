'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, DollarSign, CheckCircle2, Clock, Mic, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import toast from 'react-hot-toast'

interface VoiceoverScript {
  id: string
  title: string
  voicePrice: number
  voicePaid: boolean
  status: string
  createdAt: string
}

export default function VoiceActorDashboardPage() {
  const router = useRouter()
  const [voiceActor, setVoiceActor] = useState<any>(null)
  const [scripts, setScripts] = useState<VoiceoverScript[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/voice-actor-auth/me', { credentials: 'include' })
      const data = await res.json()

      if (!data.voiceActor) {
        router.push('/voice-actor-login')
        return
      }

      setVoiceActor(data.voiceActor)
      loadScripts(data.voiceActor.id)
    } catch (error) {
      toast.error('Oturum bilgileri yüklenemedi')
      router.push('/voice-actor-login')
    }
  }

  const loadScripts = async (voiceActorId: string) => {
    try {
      const res = await fetch('/api/voice-actor/scripts', { credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setScripts(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error loading scripts:', error)
      toast.error('Seslendirme kayıtları yüklenemedi')
      setScripts([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/voice-actor-auth/logout', { method: 'POST', credentials: 'include' })
      router.push('/voice-actor-login')
    } catch (error) {
      router.push('/voice-actor-login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!voiceActor) return null

  const paidEarnings = scripts.filter(s => s.voicePaid).reduce((sum, script) => sum + (script.voicePrice || 0), 0)
  const totalEarnings = paidEarnings
  const pendingEarnings = scripts.filter(s => !s.voicePaid).reduce((sum, script) => sum + (script.voicePrice || 0), 0)
  const completedScripts = scripts.filter((s: any) => s.status === 'APPROVED' || s.status === 'PAID').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hoş geldiniz, {voiceActor.name}</h1>
              <p className="text-gray-600">Seslendirme ve kazanç bilgilerinizi buradan takip edebilirsiniz</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/submit-work')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
                İş Gönder
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
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tamamlanan İş</p>
                <p className="text-2xl font-bold text-gray-900">{completedScripts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Son Seslendirmeler */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Son Seslendirmelerim</h2>
          </div>
          <div className="p-6">
            {scripts.length === 0 ? (
              <div className="text-center py-12">
                <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Henüz seslendirme kaydı bulunmuyor</p>
                <button
                  onClick={() => router.push('/submit-work')}
                  className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  İlk İşini Gönder
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tarih</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Başlık</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Durum</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Kazanç</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Ödeme</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scripts.slice(0, 10).map((script: any) => (
                      <tr key={script.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(script.createdAt), 'dd MMM yyyy', { locale: tr })}
                        </td>
                        <td className="py-3 px-4 text-sm">{script.title || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            script.status === 'APPROVED' || script.status === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : script.status === 'VOICE_UPLOADED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {script.status === 'PAID' ? 'Ödendi' :
                             script.status === 'APPROVED' ? 'Onaylandı' :
                             script.status === 'VOICE_UPLOADED' ? 'Ses Yüklendi' :
                             script.status === 'WAITING_VOICE' ? 'Ses Bekleniyor' :
                             script.status === 'REJECTED' ? 'Reddedildi' : script.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-medium">
                          {script.voicePrice ? `₺${script.voicePrice.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            script.voicePaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {script.voicePaid ? 'Ödendi' : 'Bekliyor'}
                          </span>
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
