'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Film, Plus, DollarSign, Clock, CheckCircle, Calendar, X, LogOut, TrendingUp, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { AppShell } from '@/components/shared/AppShell'
import { PageHeader } from '@/components/shared/PageHeader'

interface Work {
  id: string
  title: string
  editPrice: number
  editPaid: boolean
  createdAt: string
}

export default function EditorDashboardNewPage() {
  const router = useRouter()
  const [editor, setEditor] = useState<any>(null)
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
      const res = await fetch('/api/team-auth/me')
      const data = await res.json()

      if (!data.teamMember) {
        router.push('/team-login')
        return
      }

      setEditor(data.teamMember)
      loadWorks(data.teamMember.id)
    } catch (error) {
      toast.error('Oturum bilgileri yüklenemedi')
      router.push('/team-login')
    }
  }

  const loadWorks = async (editorId: string) => {
    try {
      const res = await fetch(`/api/content-registry?type=edit`)
      if (res.ok) {
        const data = await res.json()
        const myWorks = data.filter((w: any) => w.editor?.id === editorId)
        setWorks(myWorks.map((w: any) => ({
          id: w.id,
          title: w.title,
          editPrice: w.editPrice || 0,
          editPaid: w.editPaid || false,
          createdAt: w.createdAt
        })))
      }
    } catch (error) {
      console.error('Error loading works:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddWork = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorkTitle.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/content-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newWorkTitle,
          editorId: editor.id,
          editPrice: 0,
          editPaid: false,
          status: 'EDITING'
        })
      })

      if (res.ok) {
        toast.success('İş başarıyla eklendi!')
        setNewWorkTitle('')
        setShowAddModal(false)
        loadWorks(editor.id)
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
    await fetch('/api/team-auth/logout', { method: 'POST' })
    router.push('/team-login')
  }

  // Calculate earnings
  const totalEarnings = works.reduce((sum, w) => sum + (w.editPrice || 0), 0)
  const paidEarnings = works.filter(w => w.editPaid).reduce((sum, w) => sum + (w.editPrice || 0), 0)
  const pendingEarnings = works.filter(w => !w.editPaid).reduce((sum, w) => sum + (w.editPrice || 0), 0)

  if (loading) {
    return (
      <AppShell role="team" user={editor}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell role="team" user={editor}>
      <PageHeader
        title={`Hoş geldiniz, ${editor?.name}`}
        description="Video editörlük işlerinizi yönetin"
      />

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Toplam Kazanç</p>
                <p className="text-3xl font-bold text-gray-900">{totalEarnings.toLocaleString('tr-TR')} ₺</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ödenen</p>
                <p className="text-3xl font-bold text-emerald-600">{paidEarnings.toLocaleString('tr-TR')} ₺</p>
              </div>
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Bekleyen</p>
                <p className="text-3xl font-bold text-orange-600">{pendingEarnings.toLocaleString('tr-TR')} ₺</p>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-7 h-7 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Work Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all transform hover:scale-105 text-lg"
          >
            <Plus className="w-6 h-6" />
            Yeni İş Ekle
          </button>
        </div>

        {/* Works List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-2xl font-bold text-gray-900">İşlerim ({works.length})</h2>
          </div>

          {works.length === 0 ? (
            <div className="p-16 text-center">
              <Film className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz iş yok</h3>
              <p className="text-gray-500 mb-6">İlk işini ekleyerek başla!</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
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
                          {work.editPrice > 0 ? `${work.editPrice.toLocaleString('tr-TR')} ₺` : 'Ücret belirlenmedi'}
                        </div>
                      </div>
                    </div>
                    <div>
                      {work.editPaid ? (
                        <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
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
      </div>

      {/* Add Work Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Yeni İş Ekle</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  placeholder="Örn: Maç Özeti - Fenerbahçe vs Galatasaray"
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
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newWorkTitle.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {submitting ? 'Ekleniyor...' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}

