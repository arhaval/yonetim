'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, Plus, DollarSign, Clock, CheckCircle, Calendar, X, LogOut, TrendingUp, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { AppShell } from '@/components/shared/AppShell'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'

interface Work {
  id: string
  title: string
  voicePrice: number
  voicePaid: boolean
  createdAt: string
}

export default function VoiceActorDashboardPage() {
  const router = useRouter()
  const [voiceActor, setVoiceActor] = useState<any>(null)
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newWorkTitle, setNewWorkTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/voice-actor-auth/me')
      const data = await res.json()

      if (!data.voiceActor) {
        router.push('/voice-actor-login')
        return
      }

      setVoiceActor(data.voiceActor)
      loadWorks(data.voiceActor.id)
    } catch (error) {
      toast.error('Oturum bilgileri yüklenemedi')
      router.push('/voice-actor-login')
    }
  }

  const loadWorks = async (voiceActorId: string) => {
    try {
      const res = await fetch(`/api/content-registry?type=voice&filterVoiceActorId=${voiceActorId}`)
      if (res.ok) {
        const data = await res.json()
        setWorks(data)
      }
    } catch (error) {
      console.error('Error loading works:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddWork = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorkTitle.trim()) {
      toast.error('İş başlığı gerekli')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/content-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newWorkTitle,
          voiceActorId: voiceActor.id,
          voicePrice: 0, // Admin sonra belirleyecek
          voicePaid: false,
          status: 'VOICE_READY'
        })
      })

      if (res.ok) {
        toast.success('İş başarıyla eklendi')
        setNewWorkTitle('')
        setShowAddModal(false)
        loadWorks(voiceActor.id)
      } else {
        toast.error('İş eklenemedi')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/voice-actor-auth/logout', { method: 'POST' })
    router.push('/voice-actor-login')
  }

  if (loading) {
    return (
      <AppShell role="voiceActor" user={voiceActor}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AppShell>
    )
  }

  const totalEarnings = works.reduce((sum, w) => sum + (w.voicePrice || 0), 0)
  const paidEarnings = works.filter(w => w.voicePaid).reduce((sum, w) => sum + (w.voicePrice || 0), 0)
  const pendingEarnings = works.filter(w => !w.voicePaid).reduce((sum, w) => sum + (w.voicePrice || 0), 0)

  return (
    <AppShell role="voiceActor" user={voiceActor}>
      <PageHeader
        title={`Hoş geldiniz, ${voiceActor?.name}`}
        description="Seslendirme işlerinizi yönetin"
      />

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Toplam Kazanç</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalEarnings.toLocaleString('tr-TR')} ₺</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Ödenen</p>
                <p className="text-3xl font-bold text-green-700 mt-1">{paidEarnings.toLocaleString('tr-TR')} ₺</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Bekleyen</p>
                <p className="text-3xl font-bold text-orange-700 mt-1">{pendingEarnings.toLocaleString('tr-TR')} ₺</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Work Button */}
        <div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Yeni İş Ekle
          </button>
        </div>

        {/* Works List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">İşlerim ({works.length})</h2>
          </div>

          {works.length === 0 ? (
            <div className="p-12 text-center">
              <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Henüz iş yok</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                İlk İşini Ekle
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {works.map((work) => (
                <div key={work.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{work.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(work.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {work.voicePrice > 0 ? `${work.voicePrice.toLocaleString('tr-TR')} ₺` : 'Ücret belirlenmedi'}
                        </div>
                      </div>
                    </div>
                    <div>
                      {work.voicePaid ? (
                        <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4" />
                          Ödendi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                          <Clock className="w-4 h-4" />
                          Bekliyor
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Add Work Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Yeni İş Ekle</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddWork} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İş Başlığı *
                </label>
                <input
                  type="text"
                  value={newWorkTitle}
                  onChange={(e) => setNewWorkTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Örn: Maç Özeti Seslendirmesi"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Admin daha sonra ücret belirleyecek
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
                >
                  {submitting ? 'Ekleniyor...' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AppShell>
  )
}
